/*
powerfullz 的 Substore 订阅转换脚本 - 采用主力/备用/链式代理结构
https://github.com/powerfullz/override-rules
传入参数：
- loadbalance: 启用负载均衡 (默认false)
- landing: 启用落地节点功能 (默认false)
- ipv6: 启用 IPv6 支持 (默认true)  <-- 默认已修改
- full: 启用完整配置，用于纯内核启动 (默认false)
- keepalive: 启用 tcp-keep-alive (默认false)
- fakeip: DNS 使用 FakeIP 而不是 RedirHost (默认true)  <-- 默认已修改
*/

const inArg = typeof $arguments !== 'undefined' ? $arguments : {};

// 修改默认值：ipv6Enabled 默认 true
const ipv6EnabledDefault = true;
// 修改默认值：fakeIPEnabled 默认 true
const fakeIPEnabledDefault = true;

const loadBalance = parseBool(inArg.loadbalance) || false,
    landing = parseBool(inArg.landing) || false,
    ipv6Enabled = parseBool(inArg.ipv6) || ipv6EnabledDefault, // 默认改为 true
    fullConfig = parseBool(inArg.full) || false,
    keepAliveEnabled = parseBool(inArg.keepalive) || false,
    fakeIPEnabled = parseBool(inArg.fakeip) || fakeIPEnabledDefault; // 默认改为 true

// 定义主力节点的匹配正则表达式
const mainProxyFilter = "(?i)(ix|bage|cf|jinx|bero|bwh|riddler|yyy|深港出口|出口|megabox)|(?-i)aws";
// 定义备用节点的排除正则表达式 (非主力节点)
// const fallbackProxyExcludeFilter = `^(?!.*(${mainProxyFilter})).*`; // 此变量未被使用，故删除


// 精简后的 ruleProviders (保持不变)
const ruleProviders = {
    "ADBlock": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://adrules.top/adrules_domainset.txt",
        "path": "./ruleset/ADBlock.txt"
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
}

// 更新 rules: 将原来的 '选择节点' 替换为 '主力' (保持不变)
const rules = [
    "RULE-SET,ADBlock,广告拦截",
    "RULE-SET,AdditionalFilter,广告拦截",
    "RULE-SET,GoogleFCM,直连",
    "GEOSITE,GOOGLE-PLAY@CN,直连",
    "GEOSITE,MICROSOFT@CN,直连",
    "GEOSITE,GFW,主力",
    "GEOSITE,CN,直连",
    "GEOSITE,PRIVATE,直连",
    "GEOIP,CN,直连",
    "GEOIP,PRIVATE,直连",
    "MATCH,主力"
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

// RedirHost DNS 配置 (未修改)
const dnsConfig = {
    "enable": true,
    "ipv6": ipv6Enabled, // 使用参数值，如果未传入，则为 true
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

// FakeIP DNS 配置 (未修改)
const dnsConfig2 = {
    // 提供使用 FakeIP 的 DNS 配置
    "enable": true,
    "ipv6": ipv6Enabled, // 使用参数值，如果未传入，则为 true
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

// 地区元数据，已不再使用
const countriesMeta = {};

function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return false;
}

function hasLowCost(config) {
    // 低倍率节点逻辑已在此配置中被移除，此函数仅为兼容而保留，返回 false
    return false;
}

// 地区分析和地区组构建函数已移除或修改为返回空值
function parseCountries(config) { return []; }
function buildCountryProxyGroups(countryList) { return []; }


// 代理组构建 (保持不变)
function buildProxyGroups() {
    return [
        // 1. 主力组 (Main / Select)
        {
            "name": "主力",
            "type": "select",
            "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
            "include-all": true,
            "filter": mainProxyFilter,
            "proxies": [
                "链式代理",
                "落地节点",
                "备用",
                "DIRECT"
            ]
        },
        // 2. 备用组 (Fallback / URL-Test)
        {
            "name": "备用",
            "type": loadBalance ? "load-balance" : "url-test", // 根据 loadbalance 参数使用 url-test 或 load-balance
            "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
            "include-all": true,
            "exclude-filter": mainProxyFilter, // 排除主力节点
            "url": "http://www.gstatic.com/generate_204",
            "interval": 300,
            "tolerance": 50
        },
        // 3. 链式代理组 (Relay)
        {
            "name": "链式代理",
            "type": "relay",
            "icon": "
