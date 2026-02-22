export interface ThreatData {
    hasData: boolean;
    metadata: {
        timestamp: string;
        currentHour: string;
        minutesUntilReset: number;
        totalAttacks: number;
        totalIPs: number;
    };
    threats: {
        rank: number;
        ip: string;
        totalAttacks: number;
        attackTypes: {
            type: string;
            count: number;
        }[];
        enrichment: {
            country: string;
            asn: string;
            org: string;
        };
    }[];
}

// Temporary mock data for development
export const mockThreatData: ThreatData = {
    hasData: true,
    metadata: {
        timestamp: new Date().toISOString(),
        currentHour: "6 PM",
        minutesUntilReset: 45,
        totalAttacks: 14592,
        totalIPs: 892,
    },
    threats: [
        {
            rank: 1,
            ip: "192.168.1.100",
            totalAttacks: 4502,
            attackTypes: [
                { type: "Cowrie", count: 2100 },
                { type: "Dionaea", count: 1800 },
                { type: "Adbhoney", count: 602 }
            ],
            enrichment: {
                country: "United States",
                asn: "AS15169",
                org: "Google LLC"
            }
        },
        {
            rank: 2,
            ip: "45.22.10.5",
            totalAttacks: 3105,
            attackTypes: [
                { type: "ElasticPot", count: 3000 },
                { type: "Wordpot", count: 105 }
            ],
            enrichment: {
                country: "Russia",
                asn: "AS12345",
                org: "Some Hosting Provider"
            }
        },
        {
            rank: 3,
            ip: "114.114.114.114",
            totalAttacks: 2840,
            attackTypes: [
                { type: "Cowrie", count: 2840 }
            ],
            enrichment: {
                country: "China",
                asn: "AS4134",
                org: "Chinanet"
            }
        },
        {
            rank: 4,
            ip: "8.8.8.8",
            totalAttacks: 1200,
            attackTypes: [
                { type: "Log4pot", count: 1200 }
            ],
            enrichment: {
                country: "United States",
                asn: "AS15169",
                org: "Google LLC"
            }
        },
        {
            rank: 5,
            ip: "1.1.1.1",
            totalAttacks: 940,
            attackTypes: [
                { type: "Mailoney", count: 940 }
            ],
            enrichment: {
                country: "Australia",
                asn: "AS13335",
                org: "Cloudflare, Inc."
            }
        }
    ]
};
