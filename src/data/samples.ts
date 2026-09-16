import { SampleDataset } from '../types';

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'store-catalog',
    name: 'E-Commerce Store & Books',
    category: 'Catalog',
    description: 'Classic JSONPath reference dataset with books, bicycles, pricing, and nested categories.',
    defaultPathQuery: '$.store.book[?(@.price < 10)]',
    data: {
      store: {
        name: "OmniStore Central",
        location: {
          city: "San Francisco",
          state: "CA",
          country: "USA",
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        book: [
          {
            category: "reference",
            author: "Nigel Rees",
            title: "Sayings of the Century",
            price: 8.95,
            isbn: "0-553-21311-3",
            inStock: true,
            tags: ["quotes", "history", "classics"]
          },
          {
            category: "fiction",
            author: "Evelyn Waugh",
            title: "Sword of Honour",
            price: 12.99,
            isbn: "0-14-018260-X",
            inStock: false,
            tags: ["war", "trilogy", "british"]
          },
          {
            category: "fiction",
            author: "Herman Melville",
            title: "Moby Dick",
            isbn: "0-553-21311-3",
            price: 8.99,
            inStock: true,
            tags: ["sea", "whale", "classic"]
          },
          {
            category: "fiction",
            author: "J. R. R. Tolkien",
            title: "The Lord of the Rings",
            isbn: "0-395-19395-8",
            price: 22.99,
            inStock: true,
            tags: ["fantasy", "epic", "adventure"]
          }
        ],
        bicycle: {
          color: "red",
          price: 199.95,
          gears: 21,
          model: "Cruiser Pro"
        }
      },
      expensive: 10
    }
  },
  {
    id: 'k8s-pod',
    name: 'Kubernetes Pod Deployment',
    category: 'DevOps',
    description: 'Cloud infrastructure deployment spec with containers, volume mounts, and status health.',
    defaultPathQuery: '$..containers[*].image',
    data: {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: "api-gateway-deployment",
        namespace: "production",
        labels: {
          app: "api-gateway",
          tier: "backend",
          environment: "prod"
        },
        annotations: {
          "deployment.kubernetes.io/revision": "4"
        }
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: "api-gateway"
          }
        },
        template: {
          metadata: {
            labels: {
              app: "api-gateway"
            }
          },
          spec: {
            containers: [
              {
                name: "gateway-proxy",
                image: "envoyproxy/envoy:v1.28.0",
                ports: [
                  { name: "http", containerPort: 8080, protocol: "TCP" },
                  { name: "admin", containerPort: 9901, protocol: "TCP" }
                ],
                resources: {
                  limits: { cpu: "1000m", memory: "1Gi" },
                  requests: { cpu: "250m", memory: "256Mi" }
                }
              },
              {
                name: "metrics-exporter",
                image: "prom/statsd-exporter:v0.22.8",
                ports: [
                  { name: "metrics", containerPort: 9102, protocol: "TCP" }
                ]
              }
            ]
          }
        }
      }
    }
  },
  {
    id: 'user-auth',
    name: 'User RBAC & Profile',
    category: 'Identity',
    description: 'User authentication object with roles, verified emails, session tokens, and security audits.',
    defaultPathQuery: '$.user.roles[?(@.active == true)].permissions[*]',
    data: {
      user: {
        id: "usr_994821a8-8e3b-410a-b287-19ff2a348e30",
        email: "alex.chen@stitch.dev",
        username: "alexc",
        profile: {
          fullName: "Alex Chen",
          title: "Staff Systems Engineer",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          verified: true,
          joinedAt: "2023-01-15T09:30:00Z"
        },
        roles: [
          {
            name: "Admin",
            active: true,
            permissions: ["users:read", "users:write", "clusters:deploy", "audit:view"]
          },
          {
            name: "BillingViewer",
            active: false,
            permissions: ["billing:read"]
          }
        ],
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            slack: true,
            frequency: "immediate"
          }
        }
      },
      status: "authenticated",
      tokenExpiry: 1735689600
    }
  },
  {
    id: 'rest-api',
    name: 'GitHub API Repository Response',
    category: 'REST API',
    description: 'Repository information with stars, forks, license info, topics, and owner details.',
    defaultPathQuery: '$..topics[*]',
    data: {
      id: 42091823,
      node_id: "MDEwOlJlcG9zaXRvcnk0MjA5MTgyMw==",
      name: "json-toolkit-stitch",
      full_name: "google-stitch/json-toolkit-stitch",
      private: false,
      owner: {
        login: "google-stitch",
        id: 1049281,
        type: "Organization",
        site_admin: false
      },
      stargazers_count: 3410,
      watchers_count: 3410,
      forks_count: 284,
      open_issues_count: 12,
      license: {
        key: "apache-2.0",
        name: "Apache License 2.0",
        spdx_id: "Apache-2.0"
      },
      topics: ["json", "jsonpath", "json-schema", "developer-tools", "typescript", "devtools"],
      visibility: "public"
    }
  }
];
