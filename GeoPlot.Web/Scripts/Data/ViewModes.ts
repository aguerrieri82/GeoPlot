namespace WebApp.GeoPlot {

    export type ViewMode = "district" | "region" | "country" |"details";

    interface IViewModeData {
        label: { singular: string, plural: string };
        mapGroup: string;
        areaType: GeoAreaType;
        validateId: (id: string) => boolean;
        tab: string;
    }

    export var ViewModes : { [K in ViewMode]: IViewModeData } = {
        "district": {
            label: {
                singular: $string("$(district)"),
                plural: $string("$(districts)")
            },
            mapGroup: "group_district",
            tab: "districtTab",
            areaType: GeoAreaType.District,
            validateId: (id: string) => id[0].toLowerCase() == 'd'
        },
        "region": {
            label: {
                singular: $string("$(region)"),
                plural: $string("$(regions)")
            },
            mapGroup: "group_region",
            tab: "regionTab",
            areaType: GeoAreaType.Region,
            validateId: (id: string) => id[0].toLowerCase() == 'r'
        },
        "country": {
            label: {
                singular: $string("$(italian)"),
                plural: $string("$(italians)")
            },
            mapGroup: "group_country",
            tab: "italyTab",
            areaType: GeoAreaType.Country,
            validateId: (id: string) => id.toLowerCase() == 'it'
        },
        'details': {
            label: {
                singular: $string("$(area-details)"),
                plural: $string("$(area-details)")
            },
            mapGroup: "group_municipality",
            tab: "detailsTab",
            areaType: GeoAreaType.Municipality,
            validateId: (id: string) => id[0].toLowerCase() == 'm'
        }
    }
}


