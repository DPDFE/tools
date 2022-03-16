interface GrayConfig {
    grayItems: GrayItems[];
    routeKeysConfig: RouteKeyConfig[];
}

interface GrayItems {
    open: boolean;
    service: string;
    config: grayItemConifg[];
}

interface grayItemConifg {
    grayRatio: number;
    predicaterGroups: predicater[];
}

interface predicater {
    predicaters: predicatersCondition[];
    routeKeys: RouteKeyConfig[];
}

interface predicatersCondition {
    open: boolean;
    type: keyof typeof type;
    paramName?: string;
    regex: string;
    excludes: string[];
    includes: string[];
}

enum type {
    IP,
    PATH,
    HOST,
    URL,
    COOKIE,
    HEADER,
}

interface RouteKeyConfig {
    type: keyof typeof type;
    paramName?: string;
    saltValue: number;
}
