<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('main_table', function (Blueprint $table) {

            $table->increments('mid'); // int AUTO_INCREMENT primary key

            $table->string('name', 200);
            $table->string('email', 200)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('message', 255)->nullable();
            $table->string('state', 255)->nullable();
            $table->string('q_type', 200)->nullable();
            $table->string('title_page', 200)->nullable();
            $table->string('status', 100)->nullable();
            $table->text('remark')->nullable();

            $table->dateTime('date')->useCurrent();

            $table->integer('status_u_id')->nullable();
            $table->integer('data_f')->nullable();
            $table->integer('add_data')->default(0);

            $table->string('PaymentStatus', 255)->nullable();
            $table->string('PaymentAmount', 255)->nullable();

            $table->dateTime('follow_up_date')->nullable();
            $table->string('hotlead', 255)->nullable();

            $table->string('calls', 255)->nullable();
            $table->string('mails', 255)->nullable();
            $table->string('watsp', 255)->nullable();

            $table->string('ActulQuery', 50)->nullable();

            $table->string('callback', 255)->nullable();
            $table->dateTime('callback_date')->nullable();

            $table->integer('data_type')->nullable();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('main_table');
    }
};
