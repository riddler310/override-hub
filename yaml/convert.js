/* powerfullz 的 Substore 订阅转换脚本 https://github.com/powerfullz/override-rules 传入参数： - loadbalance: 启用负载均衡 (默认false) - landing: 启用落地节点功能 (默认false) - ipv6: 启用 IPv6 支持 (默认false) - full: 启用完整配置，用于纯内核启动 (默认false) - keepalive: 启用 tcp-keep-alive (默认false) - fakeip: DNS 使用 FakeIP 而不是 RedirHost (默认false) */ 
const inArg = typeof $arguments !== 'undefined' ? $arguments : {}; 
const loadBalance = parseBool(inArg.loadbalance) || false, 
    landing = parseBool(inArg.landing) || false, 
    ipv6Enabled = parseBool(inArg.ipv6) || false, 
    fullConfig = parseBool(inArg.full) || false, 
    keepAliveEnabled = parseBool(inArg.keepalive) || false, 
    fakeIPEnabled = parseBool(inArg.fakeip) || false;

// ！！！ 动态地区节点/低倍率相关函数已移除或修改，简化为基础策略 ！！！

function buildBaseLists({ landing, lowCost, countryInfo }) { 
    // 基础策略列表不再包含动态生成的地区节点组
    const selector = ["故障转移"];
    if (landing) selector.push("落地节点"); 
    if (lowCost) selector.push("低倍率节点"); 
    selector.push("手动选择", "DIRECT"); 
    
    // 默认代理链 (选择节点, 低倍率节点(可选), 手动选择, 直连)
    const defaultProxies = ["选择节点"]; 
    if (lowCost) defaultProxies.push("低倍率节点"); 
    defaultProxies.push("手动选择", "直连"); 
    
    // 直连优先列表（低倍率节点在这里意义不大，但保留逻辑）
    const defaultProxiesDirect = ["直连", "选择节点", "手动选择"];
    
    const defaultFallback = []; 
    if (landing) defaultFallback.push("落地节点"); 
    if (lowCost) defaultFallback.push("低倍率节点"); 
    defaultFallback.push("手动选择", "DIRECT"); 
    
    // 返回空数组，因为不再创建地区节点组
    return { defaultProxies, defaultProxiesDirect, defaultSelector: selector, defaultFallback, countryGroupNames: [] }; 
} 

const ruleProviders = { 
    "ADBlock": { 
        "type": "http", 
        "behavior": "domain", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://adrules.top/adrules_domainset.txt", 
        "path": "./ruleset/ADBlock.txt" 
    }, 
    /* 已删除 StaticResources, CDNResources */
    "AI": { 
        "type": "http", 
        "behavior": "classical", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://ruleset.skk.moe/Clash/non_ip/ai.txt", 
        "path": "./ruleset/AI.txt" 
    }, 
    "TikTok": { 
        "type": "http", 
        "behavior": "classical", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list", 
        "path": "./ruleset/TikTok.list" 
    }, 
    "SteamFix": { 
        "type": "http", 
        "behavior": "classical", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list", 
        "path": "./ruleset/SteamFix.list" 
    }, 
    "GoogleFCM": { 
        "type": "http", 
        "behavior": "classical", 
        "interval": 86400, 
        "format": "text", 
        "path": "./ruleset/FirebaseCloudMessaging.list", 
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/FirebaseCloudMessaging.list", 
    }, 
    "AdditionalFilter": { 
        "type": "http", 
        "behavior": "classical", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list", 
        "path": "./ruleset/AdditionalFilter.list" 
    }, 
    "AdditionalCDNResources": { 
        "type": "http", 
        "behavior": "classical", 
        "format": "text", 
        "interval": 86400, 
        "url": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalCDNResources.list", 
        "path": "./ruleset/AdditionalCDNResources.list" 
    }, 
} 

const rules = [ 
    "RULE-SET,ADBlock,广告拦截", 
    "RULE-SET,AdditionalFilter,广告拦截", 
    /* 已删除 StaticResources, CDNResources 规则 */
    "RULE-SET,AdditionalCDNResources,选择节点", // 将 CDN 规则导向选择节点，而非静态资源组
    "RULE-SET,AI,AI", 
    "RULE-SET,TikTok,TikTok", 
    "RULE-SET,SteamFix,直连", 
    "RULE-SET,GoogleFCM,直连", 
    "GEOSITE,GOOGLE-PLAY@CN,直连", 
    "GEOSITE,TELEGRAM,Telegram", 
    "GEOSITE,YOUTUBE,YouTube", 
    "GEOSITE,NETFLIX,Netflix", 
    /* 已删除 Bahamut, Spotify, Crypto 规则 */
    /* 已删除 Bilibili 规则 */
    "GEOSITE,MICROSOFT@CN,直连", 
    "GEOSITE,GFW,选择节点", 
    "GEOSITE,CN,直连", 
    "GEOSITE,PRIVATE,直连", 
    "GEOIP,NETFLIX,Netflix,no-resolve", 
    "GEOIP,TELEGRAM,Telegram,no-resolve", 
    "GEOIP,CN,直连", 
    "GEOIP,PRIVATE,直连", 
    "MATCH,选择节点" 
]; 

const snifferConfig = { 
    "sniff": { 
        "TLS": { "ports": [443, 8443], }, 
        "HTTP": { "ports": [80, 8080, 8880], }, 
        "QUIC": { "ports": [443, 8443], } 
    }, 
    "override-destination": false, 
    "enable": true, 
    "force-dns-mapping": true, 
    "skip-domain": [ "Mijia Cloud", "dlg.io.mi.com", "+.push.apple.com" ] 
}; 

const dnsConfig = { 
    "enable": true, "ipv6": ipv6Enabled, "prefer-h3": true, "enhanced-mode": "redir-host", 
    "default-nameserver": [ "119.29.29.29", "223.5.5.5", ], 
    "nameserver": [ "system", "223.5.5.5", "119.29.29.29", "180.184.1.1", ], 
    "fallback": [ "quic://dns0.eu", "https://dns.cloudflare.com/dns-query", "https://dns.sb/dns-query", "tcp://208.67.222.222", "tcp://8.26.56.2" ], 
    "proxy-server-nameserver": [ "quic://223.5.5.5", "tls://dot.pub", ] 
}; 

const dnsConfig2 = { 
    "enable": true, "ipv6": ipv6Enabled, "prefer-h3": true, "enhanced-mode": "fake-ip", 
    "fake-ip-filter": [ "geosite:private", "geosite:connectivity-check", "geosite:cn", "Mijia Cloud", "dig.io.mi.com", "localhost.ptlogin2.qq.com", "*.icloud.com", "*.stun.*.*", "*.stun.*.*.*" ], 
    "default-nameserver": [ "119.29.29.29", "223.5.5.5", ], 
    "nameserver": [ "system", "223.5.5.5", "119.29.29.29", "180.184.1.1", ], 
    "fallback": [ "quic://dns0.eu", "https://dns.cloudflare.com/dns-query", "https://dns.sb/dns-query", "tcp://208.67.222.222", "tcp://8.26.56.2" ], 
    "proxy-server-nameserver": [ "quic://223.5.5.5", "tls://dot.pub", ] 
}; 

const geoxURL = { 
    "geoip": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat", 
    "geosite": "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat", 
    "mmdb": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb", 
    "asn": "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb" 
}; 

// 地区元数据（仅用于 hasLowCost/parseCountries 函数，在此处为兼容性保留，实际已不用于生成代理组）
const countriesMeta = { 
    "香港": { pattern: "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|🇭🇰", icon: "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png" }, 
    "澳门": { pattern: "(?i)澳门|MO|Macau|🇲🇴", icon: "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Macao.png" }, 
    "台湾": { pattern: "(?i)台|新北|彰化|TW|Taiwan|🇹🇼", icon: "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png" }, 
    // ... 其他地区元数据 
}; 

function parseBool(value) { 
    if (typeof value === "boolean") return value; 
    if (typeof value === "string") { 
        return value.toLowerCase() === "true" || value === "1"; 
    } 
    return false; 
} 

function hasLowCost(config) { 
    // 检查是否有低倍率节点 
    const proxies = config["proxies"]; 
    const lowCostRegex = new RegExp(/0\.[0-5]|低倍率|省流|大流量|实验性/, 'i'); 
    for (const proxy of proxies) { 
        if (lowCostRegex.test(proxy.name)) { 
            return true; 
        } 
    } 
    return false; 
} 
// 由于不再生成地区组，parseCountries 和 buildCountryProxyGroups 已被注释或删除
function parseCountries(config) { return []; } 
function buildCountryProxyGroups(countryList) { return []; }


function buildProxyGroups({ countryList, countryProxyGroups, lowCost, defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback }) { 
    
    // 排除落地节点、选择节点和故障转移以避免死循环 
    const frontProxySelector = [ 
        ...defaultSelector.filter(name => name !== "落地节点" && name !== "故障转移") 
    ]; 
    
    return [ 
        { 
            "name": "选择节点", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png", 
            "type": "select", 
            "proxies": defaultSelector 
        }, 
        { 
            "name": "手动选择", 
            "icon": "https://cdn.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png", 
            "include-all": true, 
            "type": "select" 
        }, 
        (landing) ? { 
            "name": "前置代理", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Area.png", 
            "type": "select", 
            "include-all": true, 
            "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地", 
            "proxies": frontProxySelector 
        } : null, 
        (landing) ? { 
            "name": "落地节点", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png", 
            "type": "select", 
            "include-all": true, 
            "filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地", 
        } : null, 
        { 
            "name": "故障转移", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png", 
            "type": "fallback", 
            "url": "https://cp.cloudflare.com/generate_204", 
            "proxies": defaultFallback, 
            "interval": 180, 
            "tolerance": 20, 
            "lazy": false 
        }, 
        /* 已删除 静态资源 代理组 */
        { 
            "name": "AI", 
            "icon": "https://cdn.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png", 
            "type": "select", 
            "proxies": defaultProxies 
        }, 
        { 
            "name": "Telegram", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png", 
            "type": "select", 
            "proxies": defaultProxies 
        }, 
        { 
            "name": "YouTube", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png", 
            "type": "select", 
            "proxies": defaultProxies 
        }, 
        /* 已删除 Bilibili 代理组 */
        { 
            "name": "Netflix", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png", 
            "type": "select", 
            "proxies": defaultProxies 
        }, 
        { 
            "name": "TikTok", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png", 
            "type": "select", 
            "proxies": defaultProxies 
        }, 
        { 
            "name": "直连", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png", 
            "type": "select", 
            "proxies": [ "DIRECT", "选择节点" ] 
        }, 
        { 
            "name": "广告拦截", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png", 
            "type": "select", 
            "proxies": [ "REJECT", "直连" ] 
        }, 
        (lowCost) ? { 
            "name": "低倍率节点", 
            "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Lab.png", 
            "type": "url-test", 
            "url": "https://cp.cloudflare.com/generate_204", 
            "include-all": true, 
            "filter": "(?i)0\.[0-5]|低倍率|省流|大流量|实验性" 
        } : null, 
        ...countryProxyGroups // 此时 countryProxyGroups 为空数组 []
    ].filter(Boolean); 
} 

function main(config) { 
    config = { proxies: config.proxies }; 
    
    // 解析地区与低倍率信息。地区信息已不再用于分组，仅检查低倍率
    const countryInfo = parseCountries(config); 
    const lowCost = hasLowCost(config); 
    
    // 构建基础数组 
    // countryGroupNames: []
    const { defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, countryGroupNames: targetCountryList } = buildBaseLists({ landing, lowCost, countryInfo }); 
    
    // 为地区构建对应的 url-test / load-balance 组 (返回空数组)
    const countryProxyGroups = buildCountryProxyGroups(targetCountryList.map(n => n.replace(/节点$/, ''))); 
    
    // 生成代理组 
    const proxyGroups = buildProxyGroups({ 
        countryList: targetCountryList.map(n => n.replace(/节点$/, '')), 
        countryProxyGroups, 
        lowCost, 
        defaultProxies, 
        defaultProxiesDirect, 
        defaultSelector, 
        defaultFallback 
    }); 
    
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
        "mixed-port": 7890, "redir-port": 7892, "tproxy-port": 7893, "routing-mark": 7894, 
        "allow-lan": true, "ipv6": ipv6Enabled, "mode": "rule", "unified-delay": true, 
        "tcp-concurrent": true, "find-process-mode": "off", "log-level": "info", 
        "geodata-loader": "standard", "external-controller": ":9999", 
        "disable-keep-alive": !keepAliveEnabled, 
        "profile": { "store-selected": true, } 
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
