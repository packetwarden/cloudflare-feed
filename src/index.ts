import { Hono } from 'hono'
import { mockThreatData, type ThreatData } from '../lib/data/threats'
import type { KVNamespace } from '@cloudflare/workers-types'

export interface Env {
    THREAT_FEED_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/feed', async (c) => {
    // @ts-expect-error Cloudflare specific CacheStorage extension 
    const cache = caches.default as Cache;
    // Create a Request object from the current URL to serve as the cache key
    const cacheKey = new Request(c.req.url);

    try {
        // 1. Check if the response is already in the edge cache
        let response = await cache.match(cacheKey);

        if (!response) {
            console.log('Cache API miss. Reading from KV store...');

            // cacheTtl: 60 reduces reads to the central KV store globally
            const dataString = await c.env.THREAT_FEED_KV.get('current_feed', { cacheTtl: 60 });

            let payload = mockThreatData;
            if (dataString) {
                payload = JSON.parse(dataString);
            }

            // Create a native Response object with the proper Cache-Control headers
            // max-age=60 prevents the browser from fetching on reload.
            // s-maxage=60 tells Cloudflare's CDN and Cache API to cache it for 60s.
            response = Response.json(payload, {
                headers: {
                    'Cache-Control': 'public, max-age=60, s-maxage=60'
                }
            });

            // 2. Store the cloned response in the Edge Cache non-blockingly
            c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
        } else {
            console.log('Cache API hit! Returning from edge memory.');
        }

        return response;
    } catch (error) {
        console.error('Error fetching threat data:', error);
        // Fallback to mock data (without caching it, so we can recover later)
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
