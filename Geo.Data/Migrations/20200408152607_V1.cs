using Microsoft.EntityFrameworkCore.Migrations;

namespace Geo.Data.Migrations
{
    public partial class V1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "TimeSerie",
                type: "decimal(12, 8)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(12, 8)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "TimeSerie",
                type: "decimal(12, 8)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(12, 8)",
                oldNullable: true);
        }
    }
}
