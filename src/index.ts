import { Hono } from 'hono'
import { mockThreatData, type ThreatData } from '../lib/data/threats'
import type { KVNamespace } from '@cloudflare/workers-types'

export interface Env {
    THREAT_FEED_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/feed', async (c) => {
    try {
        const dataString = await c.env.THREAT_FEED_KV.get('current_feed');
        if (dataString) {
            return c.json(JSON.parse(dataString));
        }

        // Fallback to mock data if KV is empty
        return c.json(mockThreatData);
    } catch (error) {
        console.error('Error fetching threat data:', error);
        // Return mock data for local dev without KV configured
        return c.json(mockThreatData);
    }
})

app.post('/api/ingest', async (c) => {
    try {
        const data: ThreatData = await c.req.json();

        // Basic validation
        if (!data.hasData || !data.threats || !data.metadata) {
            return c.json(
                { error: 'Invalid payload structure' },
                400
            );
        }

        if (c.env.THREAT_FEED_KV) {
            await c.env.THREAT_FEED_KV.put('current_feed', JSON.stringify(data));
            console.log('Successfully wrote to Cloudflare KV: THREAT_FEED_KV');
        } else {
            console.warn('THREAT_FEED_KV binding not found. Mock/local environment assumed.');
        }

        return c.json(
            { message: 'Data accepted', count: data.threats.length },
            200
        );
    } catch (error) {
        console.error('Error processing ingest webhook:', error);
        return c.json(
            { error: 'Internal Server Error' },
            500
        );
    }
})

export default app
