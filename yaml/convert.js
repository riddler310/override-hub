/*
powerfullz 的 Substore 订阅转换脚本
https://github.com/powerfullz/override-rules
传入参数：
- loadbalance: 启用负载均衡 (默认false)
- landing: 启用落地节点功能 (默认false)
- ipv6: 启用 IPv6 支持 (默认false -> 默认 true)
- full: 启用完整配置，用于纯内核启动 (默认false)
- keepalive: 启用 tcp-keep-alive (默认false)
- fakeip: DNS 使用 FakeIP 而不是 RedirHost (默认false -> 默认 true)
*/

const inArg = typeof $arguments !== 'undefined' ? $arguments : {};
const loadBalance = parseBool(inArg.loadbalance) || false,
    landing = parseBool(inArg.landing) || false,
    // ⚠️ 默认开启 IPv6
    ipv6Enabled = parseBool(inArg.ipv6) || true,
    fullConfig = parseBool(inArg.full) || false,
    keepAliveEnabled = parseBool(inArg.keepalive) || false,
    // ⚠️ 默认开启 FakeIP
    fakeIPEnabled = parseBool(inArg.fakeip) || true;

// 原始脚本中与动态代理组生成相关的函数已删除或留空。

// ⚠️ 替换后的静态代理组配置
const staticProxyGroups = [
    {
        "name": "主力",
        "type": "select",
        "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
        "include-all": true,
        // 匹配规则：ix、bage、cf、jinx、aws(小写)、bero、bwh、riddler、yyy、深港出口、出口
        "filter": "(?i)(ix|bage|cf|jinx|bero|bwh|riddler|yyy|深港出口|出口|megabox)|(?-i)aws",
        "proxies": [
            "链式代理",
            "落地节点",
            "备用",
            "DIRECT"
        ]
    },
    {
        "name": "备用",
        "type": "url-test",
        "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
        "include-all": true,
        // 匹配非主力节点
        "filter": "^(?!.*((?i)(ix|bage|cf|jinx|bero|bwh|riddler|yyy|深港出口|出口)|(?-i)aws)).*",
        "url": "http://www.gstatic.com/generate_204",
        "interval": 300,
        "tolerance": 50
    },
    // ===== 链式代理部分 =====
    {
        "name": "链式代理",
        "type": "relay",
        "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png",
        "proxies": [
            "中转节点",
            "落地节点"
        ]
    },
    {
        "name": "中转节点",
        "type": "select",
        "include-all": true,
        // 匹配主力 + 备用所有节点
        "filter": ".*",
        "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png",
        "proxies": [
            "DIRECT"
        ]
    },
    {
        "name": "落地节点",
        "type": "select",
        "include-all": true,
        // 匹配除主力节点和备用节点的节点
        "filter": ".*",
        "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
        "proxies": [
            "DIRECT"
        ]
    }
];


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

// 规则已调整为指向新的策略组，如 "主力"
const rules = [
    "RULE-SET,ADBlock,REJECT",
    "RULE-SET,AdditionalFilter,REJECT",
    "RULE-SET,SogouInput,直连",
    "RULE-SET,TruthSocial,主力",
    "RULE-SET,StaticResources,主力",
    "RULE-SET,CDNResources,主力",
    "RULE-SET,AdditionalCDNResources,主力",
    "RULE-SET,AI,主力",
    "RULE-SET,Crypto,主力",
    "RULE-SET,EHentai,主力",
    "RULE-SET,TikTok,主力",
    "RULE-SET,SteamFix,DIRECT",
    "RULE-SET,GoogleFCM,DIRECT",
    "GEOSITE,GOOGLE-PLAY@CN,DIRECT",
    "GEOSITE,TELEGRAM,主力",
    "GEOSITE,YOUTUBE,主力",
    "GEOSITE,NETFLIX,主力",
    "GEOSITE,SPOTIFY,主力",
    "GEOSITE,BAHAMUT,主力",
    "GEOSITE,BILIBILI,主力",
    "GEOSITE,MICROSOFT@CN,DIRECT",
    "GEOSITE,PIKPAK,主力",
    "GEOSITE,GFW,主力",
    "GEOSITE,CN,DIRECT",
    "GEOSITE,PRIVATE,DIRECT",
    "GEOIP,NETFLIX,主力,no-resolve",
    "GEOIP,TELEGRAM,主力,no-resolve",
    "GEOIP,CN,DIRECT",
    "GEOIP,PRIVATE,DIRECT",
    "DST-PORT,22,主力",
    "MATCH,主力"
];

// 辅助策略组
const extraGroups = [
    {
        "name": "直连",
        "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
        "type": "select",
        "proxies": [
            "DIRECT", "主力"
        ]
    },
    {
        "name": "REJECT",
        "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Reject.png",
        "type": "select",
        "proxies": [
            "REJECT", "DIRECT"
        ]
    },
];

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

// RedirHost DNS 配置 (在默认开启 FakeIP 时作为备选)
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

// FakeIP DNS 配置 (将作为默认配置)
const dnsConfig2 = {
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

const geoxURL = {
    "geoip": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
    "geosite": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
    "mmdb": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
    "asn": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
};

const countriesMeta = {
// ... 地区元数据已省略
};


function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return false;
}

function hasLowCost(config) {
    return false;
}
function parseCountries(config) {
    return [];
}
function buildBaseLists({ landing, lowCost, countryInfo }) {
    return { defaultProxies: [], defaultProxiesDirect: [], defaultSelector: [], defaultFallback: [], countryGroupNames: [] };
}
function buildCountryProxyGroups(countryList) {
    return [];
}
function buildProxyGroups({ countryList, countryProxyGroups, lowCost, defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback }) {
    return [];
}


function main(config) {
    config = { proxies: config.proxies };
    
    // 1. 合并静态代理组和额外的辅助组
    const proxyGroups = [...staticProxyGroups, ...extraGroups];

    // 2. 添加 GLOBAL 策略组
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

    // 3. 完整配置参数 (如果 fullConfig 为 true)
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

    // 4. 应用最终配置
    Object.assign(config, {
        "proxy-groups": proxyGroups,
        "rule-providers": ruleProviders,
        "rules": rules,
        "sniffer": snifferConfig,
        // ⚠️ fakeIPEnabled 默认为 true，因此默认使用 dnsConfig2 (FakeIP)
        "dns": fakeIPEnabled ? dnsConfig2 : dnsConfig,
        "geodata-mode": true,
        "geox-url": geoxURL,
    });

    return config;
}
