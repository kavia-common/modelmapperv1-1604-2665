import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

// In-memory stores to simulate backend state in mock mode.
const db = {
  models: [
    { id: 'm-1', name: '5G Core Service', roles: [], mappings: [] },
    { id: 'm-2', name: 'Access Network Service', roles: [], mappings: [] }
  ],
  roles: [
    { id: 'r-1', name: 'Controller', section: 'Core' },
    { id: 'r-2', name: 'Edge Router', section: 'Access' }
  ],
  mappings: [
    { id: 'map-1', source: 'Service.VLAN', target: 'Cisco:ios-xe/native/vlan', type: 'transform' }
  ],
  collaboration: { activeUsers: 2, lastChangeId: 1 }
};

export const handlers = [
  // /models
  http.get('/models', () => HttpResponse.json(db.models, { status: 200 })),
  http.post('/models', async ({ request }) => {
    const body = await request.json();
    const newModel = { id: body.id || uuidv4(), name: body.name || 'Untitled', roles: body.roles || [], mappings: body.mappings || [] };
    db.models.push(newModel);
    return HttpResponse.json(newModel, { status: 201 });
  }),
  // /models/{id}
  http.get('/models/:id', ({ params }) => {
    const model = db.models.find(m => m.id === params.id);
    if (!model) return HttpResponse.text('Not found', { status: 404 });
    return HttpResponse.json(model, { status: 200 });
  }),
  http.put('/models/:id', async ({ params, request }) => {
    const idx = db.models.findIndex(m => m.id === params.id);
    if (idx === -1) return HttpResponse.text('Not found', { status: 404 });
    const body = await request.json();
    db.models[idx] = { ...db.models[idx], ...body, id: params.id };
    return HttpResponse.json(db.models[idx], { status: 200 });
  }),
  http.delete('/models/:id', ({ params }) => {
    const idx = db.models.findIndex(m => m.id === params.id);
    if (idx === -1) return HttpResponse.text('', { status: 204 });
    db.models.splice(idx, 1);
    return HttpResponse.text('', { status: 204 });
  }),

  // /roles
  http.get('/roles', () => HttpResponse.json(db.roles, { status: 200 })),
  http.post('/roles', async ({ request }) => {
    const body = await request.json();
    const role = { id: body.id || uuidv4(), name: body.name || 'New Role', section: body.section || 'General' };
    db.roles.push(role);
    return HttpResponse.json(role, { status: 201 });
  }),

  // /mappings
  http.get('/mappings', () => HttpResponse.json(db.mappings, { status: 200 })),
  http.post('/mappings', async ({ request }) => {
    const body = await request.json();
    const mapping = { id: body.id || uuidv4(), source: body.source || '', target: body.target || '', type: body.type || 'copy' };
    db.mappings.push(mapping);
    return HttpResponse.json(mapping, { status: 201 });
  }),

  // /validate
  http.post('/validate', async ({ request }) => {
    const body = await request.json();
    // Always return success with some mock warnings info.
    const result = {
      valid: true,
      warnings: Array.isArray(body?.mappings) && body.mappings.length === 0 ? ['No mappings present.'] : []
    };
    return HttpResponse.json(result, { status: 200 });
  }),

  // /collaboration
  http.get('/collaboration', () => HttpResponse.json(db.collaboration, { status: 200 })),
  http.post('/collaboration', async ({ request }) => {
    const body = await request.json();
    db.collaboration = { ...db.collaboration, ...body };
    return HttpResponse.json(db.collaboration, { status: 200 });
  }),

  // /import
  http.post('/import', async ({ request }) => {
    const body = await request.json();
    const imported = { id: uuidv4(), name: body?.name || 'Imported Model', roles: body.roles || [], mappings: body.mappings || [] };
    db.models.push(imported);
    return HttpResponse.json(imported, { status: 201 });
  }),

  // /export
  http.get('/export', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const model = db.models.find(m => m.id === id);
    if (!model) return HttpResponse.text('Not found', { status: 404 });
    return HttpResponse.json(model, { status: 200 });
  }),

  // /device-connection
  http.post('/device-connection', async ({ request }) => {
    const body = await request.json();
    const status = {
      device: body?.device || 'unknown',
      message: 'Device connection simulated. YANG retrieval ready.',
      sessionId: uuidv4()
    };
    return HttpResponse.json(status, { status: 200 });
  }),

  // /logs
  http.post('/logs', async () => HttpResponse.json({ ok: true }, { status: 200 })),

  // /auth
  http.post('/auth', async () => {
    // Always allow in mock mode
    return HttpResponse.json({ authenticated: true }, { status: 200 });
  }),
];
