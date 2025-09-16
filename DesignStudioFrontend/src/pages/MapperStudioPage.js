import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { logger } from '../services/logger';
import './mapper.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * PUBLIC_INTERFACE
 * MapperStudioPage
 * A rich UI to:
 * - Manage mappings per role and vendor/os variant
 * - Show a vertical split (left: JSON tree, right: one-to-many XML panels)
 * - Let users upload Netconf XML (from file) or simulate device-YANG → XML retrieval
 * - Draw visual link lines by dragging between JSON keys and XML nodes
 * - Preview a combined jinja-like service definition template and save
 */
export default function MapperStudioPage() {
  const { state, api, refreshMappings } = useApp();

  // Roles pulled from AppContext (already fetched via MSW/mock or backend)
  const roles = Array.isArray(state.roles) ? state.roles : [];

  // UI state
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id || '');
  const [vendor, setVendor] = useState('generic');
  const [os, setOs] = useState('any');
  const [version, setVersion] = useState('latest');

  // Generic JSON service model (left side) — allow quick edit
  const [serviceJsonText, setServiceJsonText] = useState('{\n  "service": {\n    "name": "ExampleService",\n    "vlan": {\n      "id": 123,\n      "name": "corp"\n    },\n    "interfaces": [\n      { "name": "ge-0/0/1", "enabled": true },\n      { "name": "ge-0/0/2", "enabled": false }\n    ]\n  }\n}');
  const [serviceJson, setServiceJson] = useState({});
  const [jsonError, setJsonError] = useState('');

  // Right-side XML panels; each panel holds XML text and a small descriptor
  const [xmlPanels, setXmlPanels] = useState([
    { id: uuidv4(), name: 'Netconf XML 1', xmlText: '<config>\n  <native xmlns="http://cisco.com/ns/yang/Cisco-IOS-XE-native">\n    <vlan>\n      <vlan-list>\n        <id>{% raw %}{{ service.vlan.id }}{% endraw %}</id>\n        <name>{% raw %}{{ service.vlan.name }}{% endraw %}</name>\n      </vlan-list>\n    </vlan>\n  </native>\n</config>' }
  ]);

  // Visual links: sourcePath (json path), targetPanelId, targetXPath
  const [links, setLinks] = useState([
    { id: uuidv4(), sourcePath: 'service.vlan.id', targetPanelId: xmlPanels[0].id, targetXPath: '/config/native/vlan/vlan-list/id' },
    { id: uuidv4(), sourcePath: 'service.vlan.name', targetPanelId: xmlPanels[0].id, targetXPath: '/config/native/vlan/vlan-list/name' }
  ]);

  // Drag state for creating new links
  const [draggingFromPath, setDraggingFromPath] = useState(null);

  // Preview of combined jinja-style mapping/template
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Parse JSON safely whenever text changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(serviceJsonText);
      setServiceJson(parsed);
      setJsonError('');
    } catch (e) {
      setJsonError(e.message);
    }
  }, [serviceJsonText]);

  // Helpers to walk JSON into a flat list of leaf paths
  const jsonLeafPaths = useMemo(() => {
    const result = [];
    const walk = (obj, prefix = '') => {
      if (obj === null || typeof obj !== 'object') {
        result.push({ path: prefix, value: obj });
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
          walk(item, `${prefix}[${idx}]`);
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          if (value !== null && typeof value === 'object') {
            walk(value, newPrefix);
          } else {
            result.push({ path: newPrefix, value });
          }
        });
      }
    };
    try {
      walk(serviceJson);
    } catch (e) {
      // ignore until valid json
    }
    return result;
  }, [serviceJson]);

  // Add / remove XML panels
  const addXmlPanel = () => {
    setXmlPanels(prev => [...prev, { id: uuidv4(), name: `Netconf XML ${prev.length + 1}`, xmlText: '<config>\n  <!-- Paste or type XML here -->\n</config>' }]);
  };

  const removeXmlPanel = (id) => {
    setXmlPanels(prev => prev.filter(p => p.id !== id));
    setLinks(prev => prev.filter(l => l.targetPanelId !== id));
  };

  // Upload XML handler
  const handleXmlFileUpload = async (e, panelId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setXmlPanels(prev => prev.map(p => (p.id === panelId ? { ...p, xmlText: text } : p)));
  };

  // Simulate device fetch: pretend YANG → XML template
  const simulateFetchDeviceYang = async (panelId) => {
    setBusy(true);
    try {
      const session = await api.deviceConnection({ device: 'sim-device', host: '1.2.3.4', port: '830', username: 'demo', password: 'demo' });
      logger.info('Simulated device session', session);
      // Provide a canned XML skeleton
      const skeleton = `<config>
  <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces">
    <interface>
      <name>{% raw %}{{ service.interfaces[0].name }}{% endraw %}</name>
      <enabled>{% raw %}{{ service.interfaces[0].enabled }}{% endraw %}</enabled>
    </interface>
  </interfaces>
</config>`;
      setXmlPanels(prev => prev.map(p => (p.id === panelId ? { ...p, xmlText: skeleton } : p)));
    } catch (e) {
      logger.error('Simulated device fetch failed', e);
    } finally {
      setBusy(false);
    }
  };

  // Begin dragging from JSON leaf
  const onStartDragFromJson = (path) => {
    setDraggingFromPath(path);
  };

  // Drop on an XML node (for simplicity we treat text selection line click as a target path)
  const onDropOnXml = (panelId, xPathGuess) => {
    if (!draggingFromPath) return;
    const newLink = { id: uuidv4(), sourcePath: draggingFromPath, targetPanelId: panelId, targetXPath: xPathGuess || '/' };
    setLinks(prev => {
      // Avoid duplicates
      const exists = prev.some(l => l.sourcePath === newLink.sourcePath && l.targetPanelId === newLink.targetPanelId && l.targetXPath === newLink.targetXPath);
      return exists ? prev : [...prev, newLink];
    });
    setDraggingFromPath(null);
  };

  const removeLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  // Given XML text and a clicked line index, produce a rough XPath guess
  const guessXPathFromXmlLine = (xmlText, lineIndex) => {
    const lines = xmlText.split('\n');
    const targetLine = lines[lineIndex] || '';
    // Very naive: extract <tag> or </tag> or <tag ...>
    const tagMatch = targetLine.match(/<\s*\/?\s*([a-zA-Z0-9:_-]+)/);
    const tag = tagMatch?.[1] || 'node';
    // Construct a simple path accumulating up to current line by indentation depth
    const depth = (targetLine.match(/^\s*/)?.[0].length || 0) / 2;
    const segments = new Array(Math.max(1, Math.floor(depth))).fill(tag);
    return '/' + segments.join('/');
  };

  // Build jinja-like template preview: we combine all panels and show mapping comment lines
  const buildPreview = () => {
    const header = `# Service Definition (Vendor: ${vendor}, OS: ${os}, Version: ${version})
# Role: ${roles.find(r => r.id === activeRoleId)?.name || 'N/A'}
# Generated at: ${new Date().toISOString()}

{% raw %}{# The following template uses jinja-style placeholders mapping the service JSON to NETCONF XML #}{% endraw %}

`;
    const body = xmlPanels.map(p => {
      const content = p.xmlText || '';
      return `# Panel: ${p.name}\n${content}\n`;
    }).join('\n');

    const mappingComments = links.map(l => {
      const p = xmlPanels.find(x => x.id === l.targetPanelId);
      return `# map ${l.sourcePath} -> [${p?.name || l.targetPanelId}] ${l.targetXPath}`;
    }).join('\n');

    setPreview(`${header}${mappingComments}\n\n${body}`);
  };

  const saveDefinition = async () => {
    setBusy(true);
    setSaveStatus('');
    try {
      // Persist a minimal mapping object via mock API to demonstrate "save"
      await api.createMapping({
        source: `role:${activeRoleId}|vendor:${vendor}|os:${os}|ver:${version}`,
        target: 'service-definition',
        type: 'template'
      });
      await refreshMappings();
      setSaveStatus('Saved mapping definition.');
    } catch (e) {
      logger.error('Failed to save mapping', e);
      setSaveStatus('Failed to save.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    buildPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlPanels, links, vendor, os, version, activeRoleId]);

  // Render helpers
  const RoleTabs = () => (
    <div className="role-tabs" role="tablist" aria-label="Role mapping tabs">
      {roles.map(r => (
        <button
          key={r.id}
          role="tab"
          aria-selected={activeRoleId === r.id}
          className={`tab ${activeRoleId === r.id ? 'active' : ''}`}
          onClick={() => setActiveRoleId(r.id)}
        >
          {r.name}
          <span className="badge">{r.section}</span>
        </button>
      ))}
      {roles.length === 0 && <div className="note">No roles defined. Create roles first.</div>}
    </div>
  );

  const VendorSelector = () => (
    <div className="form-inline mt-1">
      <div className="form-group">
        <label>Vendor:</label>
        <input className="form-input" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g., cisco, juniper, nokia" />
      </div>
      <div className="form-group">
        <label>OS:</label>
        <input className="form-input" value={os} onChange={(e) => setOs(e.target.value)} placeholder="e.g., ios-xe, junos" />
      </div>
      <div className="form-group">
        <label>Version:</label>
        <input className="form-input" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g., 17.9.3" />
      </div>
    </div>
  );

  const JsonTree = () => (
    <div className="json-tree" aria-label="Service JSON tree">
      <div className="json-header">
        <div className="title small">Generic Service JSON</div>
        <div className="note">Drag from a leaf path to link with a target XML node.</div>
      </div>
      <textarea
        className={`json-editor ${jsonError ? 'invalid' : ''}`}
        value={serviceJsonText}
        onChange={(e) => setServiceJsonText(e.target.value)}
        spellCheck={false}
        aria-invalid={!!jsonError}
        aria-label="Service JSON editor"
      />
      {jsonError && <div className="form-error">JSON Error: {jsonError}</div>}
      <div className="json-leaves">
        {jsonLeafPaths.map(item => (
          <div
            key={item.path}
            className={`json-leaf ${draggingFromPath === item.path ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', item.path);
              onStartDragFromJson(item.path);
            }}
            onDragEnd={() => setDraggingFromPath(null)}
            title={`Value: ${String(item.value)}`}
          >
            <span className="dot" /> {item.path}
          </div>
        ))}
        {jsonLeafPaths.length === 0 && <div className="note">No leaf paths found. Provide valid JSON above.</div>}
      </div>
    </div>
  );

  const XmlPanels = () => (
    <div className="xml-panels" aria-label="NETCONF XML panels">
      <div className="xml-toolbar">
        <div className="title small">NETCONF XML(s)</div>
        <div className="spacer" />
        <button className="btn small" onClick={addXmlPanel}>+ Panel</button>
      </div>
      {xmlPanels.map((panel, idx) => (
        <div className="xml-panel" key={panel.id}>
          <div className="xml-panel-header">
            <input
              className="form-input"
              value={panel.name}
              onChange={(e) => setXmlPanels(prev => prev.map(p => p.id === panel.id ? { ...p, name: e.target.value } : p))}
              aria-label="Panel name"
            />
            <div className="xml-panel-actions">
              <label className="btn small">
                Upload XML
                <input type="file" accept=".xml" hidden onChange={(e) => handleXmlFileUpload(e, panel.id)} />
              </label>
              <button className="btn small" onClick={() => simulateFetchDeviceYang(panel.id)} disabled={busy}>
                {busy ? 'Fetching...' : 'Device→YANG→XML'}
              </button>
              <button className="btn small" onClick={() => removeXmlPanel(panel.id)} disabled={xmlPanels.length <= 1}>Remove</button>
            </div>
          </div>
          <XmlEditor
            xmlText={panel.xmlText}
            onChange={(text) => setXmlPanels(prev => prev.map(p => p.id === panel.id ? { ...p, xmlText: text } : p))}
            onDropLine={(lineIdx) => onDropOnXml(panel.id, guessXPathFromXmlLine(panel.xmlText, lineIdx))}
          />
          <PanelLinkList panelId={panel.id} />
        </div>
      ))}
    </div>
  );

  function XmlEditor({ xmlText, onChange, onDropLine }) {
    const textareaRef = useRef(null);
    const [lineCount, setLineCount] = useState(0);

    useEffect(() => {
      setLineCount((xmlText || '').split('\n').length);
    }, [xmlText]);

    const handleDrop = (e) => {
      e.preventDefault();
      // Determine line index from caret position
      const el = textareaRef.current;
      if (!el) return;
      const caret = el.selectionStart;
      const sub = (xmlText || '').slice(0, caret);
      const droppedLineIndex = sub.split('\n').length - 1;
      onDropLine(droppedLineIndex);
    };

    return (
      <div className="xml-editor-wrap">
        <div className="gutter" aria-hidden="true">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="line-num" title="Drop on line to create link" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="xml-editor"
          value={xmlText}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          aria-label="XML editor"
        />
      </div>
    );
  }

  function PanelLinkList({ panelId }) {
    const panelLinks = links.filter(l => l.targetPanelId === panelId);
    return (
      <div className="panel-links">
        <div className="title tiny">Links</div>
        {panelLinks.length === 0 && <div className="note">No links.</div>}
        {panelLinks.map(l => (
          <div key={l.id} className="list-item">
            <div className="mapping-path">{l.sourcePath}</div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-path">{l.targetXPath}</div>
            <button className="btn small" onClick={() => removeLink(l.id)}>Remove</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="title">Graphical Mapper</h2>
      <p className="description">Define per-role mappings from a generic JSON model to vendor/OS Netconf XML. Drag from JSON leaves to XML lines to create links. Upload XML files or simulate device-derived XML from YANG.</p>

      <RoleTabs />
      <VendorSelector />

      <div className="split-vertical">
        <div className="split-left">
          <JsonTree />
        </div>
        <div className="split-right">
          <XmlPanels />
        </div>
      </div>

      <div className="preview-save">
        <div className="title small">Jinja-style Combined Service Definition (Preview)</div>
        <textarea className="preview-text" value={preview} readOnly spellCheck={false} aria-label="Service definition preview" />
        <div className="form-actions">
          <button className="btn" onClick={buildPreview}>Refresh Preview</button>
          <button className="btn primary" onClick={saveDefinition} disabled={busy || roles.length === 0}>
            {busy ? <span className="spinner"></span> : 'Save Definition'}
          </button>
          {saveStatus && <span className={`badge ${saveStatus.includes('Saved') ? '' : 'error'}`}>{saveStatus}</span>}
        </div>
      </div>
    </div>
  );
}
