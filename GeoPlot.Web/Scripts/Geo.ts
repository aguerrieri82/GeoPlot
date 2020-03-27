namespace WebApp.GeoPlot {

    export interface IGeoPoint {
        lat: number;
        lng: number;
    }

    export class Geo {
        private static readonly EarthRadius = 6378137;
        private static readonly OriginShift = 2 * Math.PI * Geo.EarthRadius / 2;
        private static readonly OFFSET_X = 1263355;
        private static readonly OFFSET_Y = 5543162;


        static project(point: IGeoPoint): IPoint2D {
            var result: IPoint2D = { x: 0, y: 0 };
            result.x = point.lng * Geo.OriginShift / 180;
            result.y = Math.log(Math.tan((90 + point.lat) * Math.PI / 360)) / (Math.PI / 180);
            result.y = -(result.y * Geo.OriginShift / 180);
            result.x -= Geo.OFFSET_X;
            result.y -= Geo.OFFSET_Y;
            return result;
        }
    }
}