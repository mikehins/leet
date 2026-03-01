<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $games = DB::table('competitive_games')->get();
        $used = [];
        foreach ($games as $game) {
            do {
                $code = (string) random_int(1000, 9999);
            } while (in_array($code, $used, true));
            $used[] = $code;
            DB::table('competitive_games')->where('id', $game->id)->update(['code' => $code]);
        }

        Schema::table('competitive_games', function (Blueprint $table) {
            $table->string('code', 4)->change();
        });
    }

    public function down(): void
    {
        Schema::table('competitive_games', function (Blueprint $table) {
            $table->string('code', 6)->change();
        });
    }
};
