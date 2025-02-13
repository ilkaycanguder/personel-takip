using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend_employee_management.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "userroles_roleid_fkey",
                table: "userroles");

            migrationBuilder.DropForeignKey(
                name: "userroles_userid_fkey",
                table: "userroles");

            migrationBuilder.DropPrimaryKey(
                name: "userroles_pkey",
                table: "userroles");

            migrationBuilder.DropIndex(
                name: "IX_userroles_roleid",
                table: "userroles");

            migrationBuilder.RenameTable(
                name: "userroles",
                newName: "UserRoles");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "UserRoles",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "roleid",
                table: "UserRoles",
                newName: "Id");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "UserRoles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "UserRoles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "userroles",
                columns: table => new
                {
                    userid = table.Column<int>(type: "integer", nullable: false),
                    roleid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("userroles_pkey", x => new { x.userid, x.roleid });
                    table.ForeignKey(
                        name: "userroles_roleid_fkey",
                        column: x => x.roleid,
                        principalTable: "roles",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "userroles_userid_fkey",
                        column: x => x.userid,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_userroles_roleid",
                table: "userroles",
                column: "roleid");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_users_UserId",
                table: "UserRoles",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_users_UserId",
                table: "UserRoles");

            migrationBuilder.DropTable(
                name: "userroles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "UserRoles");

            migrationBuilder.RenameTable(
                name: "UserRoles",
                newName: "userroles");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "userroles",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "userroles",
                newName: "roleid");

            migrationBuilder.AlterColumn<int>(
                name: "roleid",
                table: "userroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "userroles_pkey",
                table: "userroles",
                columns: new[] { "userid", "roleid" });

            migrationBuilder.CreateIndex(
                name: "IX_userroles_roleid",
                table: "userroles",
                column: "roleid");

            migrationBuilder.AddForeignKey(
                name: "userroles_roleid_fkey",
                table: "userroles",
                column: "roleid",
                principalTable: "roles",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "userroles_userid_fkey",
                table: "userroles",
                column: "userid",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
