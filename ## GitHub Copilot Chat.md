## GitHub Copilot Chat

- Extension Version: 0.22.4 (prod)
- VS Code: vscode/1.95.1
- OS: Mac

## Network

User Settings:
```json
  "github.copilot.advanced": {
    "debug.useElectronFetcher": true,
    "debug.useNodeFetcher": false
  }
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.26.156.210 (6 ms)
- DNS ipv6 Lookup: ::ffff:20.26.156.210 (2 ms)
- Electron Fetcher (configured): HTTP 200 (61 ms)
- Node Fetcher: HTTP 200 (51 ms)
- Helix Fetcher: HTTP 200 (236 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (5 ms)
- DNS ipv6 Lookup: ::ffff:140.82.113.22 (2 ms)
- Electron Fetcher (configured): HTTP 200 (263 ms)
- Node Fetcher: HTTP 200 (262 ms)
- Helix Fetcher: HTTP 200 (265 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).