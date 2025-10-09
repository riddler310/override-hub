/*
powerfullz 的 Substore 订阅转换脚本 - 根据用户要求重新分类代理组
https://github.com/powerfullz/override-rules
传入参数：
- loadbalance: 启用负载均衡 (默认false)
- landing: 启用落地节点功能 (默认false)
- ipv6: 启用 IPv6 支持 (默认false)
- full: 启用完整配置，用于纯内核启动 (默认false)
- keepalive: 启用 tcp-keep-alive (默认false)
- fakeip: DNS 使用 FakeIP 而不是 RedirHost (默认false)
*/

const inArg = typeof $arguments !== 'undefined' ? $arguments : {};
const loadBalance = parseBool(inArg.loadbalance) || false,
    landing = parseBool(inArg.landing) || false,
    ipv6Enabled = parseBool(inArg.ipv6) || false,
    fullConfig = parseBool(inArg.full) || false,
    keepAliveEnabled = parseBool(inArg.keepalive) || false,
    fakeIPEnabled = parseBool(inArg.fakeip) || false;

// -------------------------------------------------------------------------------- //
// 辅助函数 (保留)
// -------------------------------------------------------------------------------- //

function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return false;
}

// -------------------------------------------------------------------------------- //
// Rule Providers (保留)
// -------------------------------------------------------------------------------- //

const ruleProviders = {
    "ADBlock": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://adrules.top/adrules_domainset.txt",
        "path": "./ruleset/ADBlock.txt"
    },
    "TruthSocial": {
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TruthSocial.list",
        "path": "./ruleset/TruthSocial.list",
        "behavior": "classical", "interval": 86400, "format": "text", "type": "http"
    },
    "SogouInput": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/sogouinput.txt",
        "path": "./ruleset/SogouInput.txt"
    },
    "StaticResources": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/domainset/cdn.txt",
        "path": "./ruleset/StaticResources.txt"
    },
    "CDNResources": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/cdn.txt",
        "path": "./ruleset/CDNResources.txt"
    },
    "AI": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/ai.txt",
        "path": "./ruleset/AI.txt"
    },
    "TikTok": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list",
        "path": "./ruleset/TikTok.list"
    },
    "EHentai": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/EHentai.list",
        "path": "./ruleset/EHentai.list"
    },
    "SteamFix": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list",
        "path": "./ruleset/SteamFix.list"
    },
    "GoogleFCM": {
        "type": "http", "behavior": "classical", "interval": 86400, "format": "text",
        "path": "./ruleset/FirebaseCloudMessaging.list",
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/FirebaseCloudMessaging.list",
    },
    "AdditionalFilter": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list",
        "path": "./ruleset/AdditionalFilter.list"
    },
    "AdditionalCDNResources": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalCDNResources.list",
        "path": "./ruleset/AdditionalCDNResources.list"
    },
    "Crypto": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/Crypto.list",
        "path": "./ruleset/Crypto.list"
    }
}

// -------------------------------------------------------------------------------- //
// Rules (保留)
// -------------------------------------------------------------------------------- //

const rules = [
    "RULE-SET,ADBlock,广告拦截",
    "RULE-SET,AdditionalFilter,广告拦截",
    "RULE-SET,SogouInput,搜狗输入法",
    "RULE-SET,TruthSocial,Truth Social",
    "RULE-SET,StaticResources,静态资源",
    "RULE-SET,CDNResources,静态资源",
    "RULE-SET,AdditionalCDNResources,静态资源",
    "RULE-SET,AI,AI",
    "RULE-SET,Crypto,Crypto",
    "RULE-SET,EHentai,E-Hentai",
    "RULE-SET,TikTok,TikTok",
    "RULE-SET,SteamFix,直连",
    "RULE-SET,GoogleFCM,直连",
    "GEOSITE,GOOGLE-PLAY@CN,直连",
    "GEOSITE,TELEGRAM,Telegram",
    "GEOSITE,YOUTUBE,YouTube",
    "GEOSITE,NETFLIX,Netflix",
    "GEOSITE,SPOTIFY,Spotify",
    "GEOSITE,BAHAMUT,Bahamut",
    "GEOSITE,BILIBILI,Bilibili",
    "GEOSITE,MICROSOFT@CN,直连",
    "GEOSITE,PIKPAK,PikPak",
    "GEOSITE,GFW,选择节点",
    "GEOSITE,CN,直连",
    "GEOSITE,PRIVATE,直连",
    "GEOIP,NETFLIX,Netflix,no-resolve",
    "GEOIP,TELEGRAM,Telegram,no-resolve",
    "GEOIP,CN,直连",
    "GEOIP,PRIVATE,直连",
    "DST-PORT,22,SSH(22端口)",
    "MATCH,选择节点"
];

// -------------------------------------------------------------------------------- //
// Sniffer Config (保留)
// -------------------------------------------------------------------------------- //

const snifferConfig = {
    "sniff": {
        "TLS": {
            "ports": [443, 8443],
        },
        "HTTP": {
            "ports": [80, 8080, 8880],
        },
        "QUIC": {
            "ports": [443, 8443],
        }
    },
    "override-destination": false,
    "enable": true,
    "force-dns-mapping": true,
    "skip-domain": [
        "Mijia Cloud",
        "dlg.io.mi.com",
        "+.push.apple.com"
    ]
};

// -------------------------------------------------------------------------------- //
// DNS Config (保留)
// -------------------------------------------------------------------------------- //

const dnsConfig = {
    "enable": true,
    "ipv6": ipv6Enabled,
    "prefer-h3": true,
    "enhanced-mode": "redir-host",
    "default-nameserver": [
        "119.29.29.29",
        "223.5.5.5",
    ],
    "nameserver": [
        "system",
        "223.5.5.5",
        "119.29.29.29",
        "180.184.1.1",
    ],
    "fallback": [
        "quic://dns0.eu",
        "https://dns.cloudflare.com/dns-query",
        "https://dns.sb/dns-query",
        "tcp://208.67.222.222",
        "tcp://8.26.56.2"
    ],
    "proxy-server-nameserver": [
        "quic://223.5.5.5",
        "tls://dot.pub",
    ]
};

const dnsConfig2 = {
    // 提供使用 FakeIP 的 DNS 配置
    "enable": true,
    "ipv6": ipv6Enabled,
    "prefer-h3": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-filter": [
        "geosite:private",
        "geosite:connectivity-check",
        "geosite:cn",
        "Mijia Cloud",
        "dig.io.mi.com",
        "localhost.ptlogin2.qq.com",
        "*.icloud.com",
        "*.stun.*.*",
        "*.stun.*.*.*"
    ],
    "default-nameserver": [
        "119.29.29.29",
        "223.5.5.5",
    ],
    "nameserver": [
        "system",
        "223.5.5.5",
        "119.29.29.29",
        "180.184.1.1",
    ],
    "fallback": [
        "quic://dns0.eu",
        "https://dns.cloudflare.com/dns-query",
        "https://dns.sb/dns-query",
        "tcp://208.67.222.222",
        "tcp://8.26.56.2"
    ],
    "proxy-server-nameserver": [
        "quic://223.5.5.5",
        "tls://dot.pub",
    ]
};

// -------------------------------------------------------------------------------- //
// GeoX URL (保留)
// -------------------------------------------------------------------------------- //

const geoxURL = {
    "geoip": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
    "geosite": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
    "mmdb": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
    "asn": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
};

// -------------------------------------------------------------------------------- //
// 核心函数：构建新的代理组
// -------------------------------------------------------------------------------- //

function buildProxyGroups() {
    // 主力节点筛选关键词：ix, bage, cf, jinx, aws(小写), bero, bwh, riddler, yyy, 深港出口, 出口, megabox
    const mainProxyFilter = "(?i)ix|bage|cf|jinx|aws|bero|bwh|riddler|yyy|深港出口|出口|megabox";
    
    // 备用节点排除规则：排除主力节点关键词，从而包含剩余所有节点
    const standbyProxyExcludeFilter = mainProxyFilter;

    // 新的“选择节点”的候选列表
    const newSelector = [
        "主力节点",
        "备用节点",
        "中转节点",
        "落地节点",
        "链式代理",
        "手动选择",
        "DIRECT"
    ];

    // 新的“故障转移”代理组列表
    const newFallbackProxies = [
        "主力节点",
        "备用节点",
        "中转节点",
        "落地节点",
        "链式代理",
        "手动选择",
        "DIRECT"
    ];

    return [
        {
            "name": "选择节点",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
            "type": "select",
            "proxies": newSelector
        },
        {
            "name": "手动选择",
            "icon": "https://cdn.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
            "include-all": true,
            "type": "select"
        },
        // 1. 主力节点
        {
            "name": "主力节点",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Premium.png",
            "type": (loadBalance) ? "load-balance" : "url-test",
            "include-all": true,
            "filter": mainProxyFilter, // 匹配主力关键词
            "url": "https://cp.cloudflare.com/generate_204",
            "interval": 60,
            "tolerance": 20,
            "lazy": false
        },
        // 2. 备用节点
        {
            "name": "备用节点",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Backup.png",
            "type": "url-test",
            "include-all": true,
            "exclude-filter": standbyProxyExcludeFilter, // 排除主力节点关键词
            "url": "https://cp.cloudflare.com/generate_204",
            "interval": 60,
            "tolerance": 20,
            "lazy": false
        },
        // 3. 链式代理 (包含所有节点)
        {
            "name": "链式代理",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Area.png", 
            "type": "select",
            "include-all": true,
        },
        // 4. 中转节点 (包含所有节点)
        {
            "name": "中转节点",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Tunnel.png", 
            "type": "select",
            "include-all": true,
        },
        // 5. 落地节点 (包含所有节点)
        {
            "name": "落地节点",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png",
            "type": "select",
            "include-all": true,
        },
        {
            "name": "故障转移",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png",
            "type": "fallback",
            "url": "https://cp.cloudflare.com/generate_204",
            "proxies": newFallbackProxies,
            "interval": 180,
            "tolerance": 20,
            "lazy": false
        },
        // 以下为功能策略组，全部指向新的 "选择节点"
        {
            "name": "静态资源",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png",
            "type": "select",
            "proxies": ["选择节点", "直连"],
        },
        {
            "name": "AI",
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png",
            "type": "select",
            "proxies": ["选择节点", "手动选择"],
        },
        {
            "name": "Telegram",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "YouTube",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "Bilibili",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png",
            "type": "select",
            "proxies": ["直连", "选择节点", "手动选择"]
        },
        {
            "name": "Netflix",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "Spotify",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "TikTok",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "E-Hentai",
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/Ehentai.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "PikPak",
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/PikPak.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "Truth Social",
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/TruthSocial.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "Bahamut",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "Crypto",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Cryptocurrency_3.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "SSH(22端口)",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Server.png",
            "type": "select",
            "proxies": newSelector,
        },
        {
            "name": "搜狗输入法",
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/Sougou.png",
            "type": "select",
            "proxies": [
                "直连", "REJECT"
            ]
        },
        {
            "name": "直连",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
            "type": "select",
            "proxies": [
                "DIRECT", "选择节点"
            ]
        },
        {
            "name": "广告拦截",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png",
            "type": "select",
            "proxies": [
                "REJECT", "直连"
            ]
        },
    ].filter(Boolean);
}

// -------------------------------------------------------------------------------- //
// 主函数 (精简)
// -------------------------------------------------------------------------------- //

function main(config) {
    config = { proxies: config.proxies };
    
    // 生成代理组
    const proxyGroups = buildProxyGroups();
    const globalProxies = proxyGroups.map(item => item.name);
    
    proxyGroups.push(
        {
            "name": "GLOBAL",
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
            "include-all": true,
            "type": "select",
            "proxies": globalProxies
        }
    );

    if (fullConfig) Object.assign(config, {
        "mixed-port": 7890,
        "redir-port": 7892,
        "tproxy-port": 7893,
        "routing-mark": 7894,
        "allow-lan": true,
        "ipv6": ipv6Enabled,
        "mode": "rule",
        "unified-delay": true,
        "tcp-concurrent": true,
        "find-process-mode": "off",
        "log-level": "info",
        "geodata-loader": "standard",
        "external-controller": ":9999",
        "disable-keep-alive": !keepAliveEnabled,
        "profile": {
            "store-selected": true,
        }
    });

    Object.assign(config, {
        "proxy-groups": proxyGroups,
        "rule-providers": ruleProviders,
        "rules": rules,
        "sniffer": snifferConfig,
        "dns": fakeIPEnabled ? dnsConfig2 : dnsConfig,
        "geodata-mode": true,
        "geox-url": geoxURL,
    });

    return config;
}
