using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

namespace Geo.Data.Migrations
{
    public partial class V0 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GeoArea",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ParentId = table.Column<Guid>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    InternationalName = table.Column<string>(nullable: true),
                    Type = table.Column<int>(nullable: false),
                    Code = table.Column<string>(nullable: true),
                    NationalCode = table.Column<string>(nullable: true),
                    InternationalCode = table.Column<string>(nullable: true),
                    Geometry = table.Column<Geometry>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeoArea", x => x.Id);
                    table.CheckConstraint("CK_GeoArea_Type_Enum_Constraint", "[Type] IN(0, 1, 2, 3, 4, 5, 6)");
                    table.ForeignKey(
                        name: "FK_GeoArea_GeoArea_ParentId",
                        column: x => x.ParentId,
                        principalTable: "GeoArea",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Indicator",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    MinValue = table.Column<decimal>(type: "decimal(12, 8)", nullable: true),
                    MaxValue = table.Column<decimal>(type: "decimal(12, 8)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Indicator", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TimeSerie",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GeoAreaId = table.Column<Guid>(nullable: false),
                    StartDate = table.Column<DateTime>(nullable: false),
                    EndDate = table.Column<DateTime>(nullable: true),
                    FromAge = table.Column<int>(nullable: true),
                    ToAge = table.Column<int>(nullable: true),
                    Gender = table.Column<int>(nullable: false),
                    IndicatorId = table.Column<Guid>(nullable: false),
                    Value = table.Column<decimal>(type: "decimal(12, 8)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSerie", x => x.Id);
                    table.CheckConstraint("CK_TimeSerie_Gender_Enum_Constraint", "[Gender] IN(0, 1, 2)");
                    table.ForeignKey(
                        name: "FK_TimeSerie_Indicator_IndicatorId",
                        column: x => x.IndicatorId,
                        principalTable: "Indicator",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeoArea_ParentId",
                table: "GeoArea",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSerie_IndicatorId",
                table: "TimeSerie",
                column: "IndicatorId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeoArea");

            migrationBuilder.DropTable(
                name: "TimeSerie");

            migrationBuilder.DropTable(
                name: "Indicator");
        }
    }
}
