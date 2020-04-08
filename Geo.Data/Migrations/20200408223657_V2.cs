using Microsoft.EntityFrameworkCore.Migrations;

namespace Geo.Data.Migrations
{
    public partial class V2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodeAlt",
                table: "GeoArea",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimeSerie_GeoAreaId",
                table: "TimeSerie",
                column: "GeoAreaId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSerie_GeoArea_GeoAreaId",
                table: "TimeSerie",
                column: "GeoAreaId",
                principalTable: "GeoArea",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSerie_GeoArea_GeoAreaId",
                table: "TimeSerie");

            migrationBuilder.DropIndex(
                name: "IX_TimeSerie_GeoAreaId",
                table: "TimeSerie");

            migrationBuilder.DropColumn(
                name: "CodeAlt",
                table: "GeoArea");
        }
    }
}
