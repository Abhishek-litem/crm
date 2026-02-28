<?php

use App\Http\Controllers\DataController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return redirect()->route('login');
});


Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DataController::class, 'dashboard'])->name('all.data');
    Route::get('/my-dashboard', [DataController::class, 'myDashboard'])->name('my.dashboard');
    Route::get('/pu-data', [DataController::class, 'puData'])->name('pu.data');
    Route::get('/chart', [DataController::class, 'chart'])->name('chart');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/edit/{id}', [DataController::class, "edit"])->name('edit'); // Adjusted the name to avoid conflict
    Route::post('/update-form', [DataController::class, "update"])->name('form.update');
    Route::view('/add-data', "dashboard.add-data")->name('add-data.view');
    Route::post('add-data', [DataController::class, "add_data"])->name('add-data');
    Route::delete('/data/delete', [DataController::class, "delete"])->name('data.delete');
    Route::get('unmarked/{query}', [DataController::class, "unmarked"])->name('unmarked');
    Route::get('/add-data', function () {
        return Inertia::render('AddData');
    });

    Route::post('add-data', [DataController::class, "add_data"])->name('add-data');

});

Route::middleware('superadmin')->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('/user', 'user')->name('user');
        Route::put('/user/update', 'update')->name('user.update');
        Route::delete('/user/delete', 'destroy')->name('user.delete');
        Route::post('/user/store', 'store')->name('user.store');

        Route::post('/update-checkbox', 'updateCheckbox')->name('your.ajax.route');
        Route::get('/login-details', 'login')->name('login-details');
    });
});

require __DIR__ . '/auth.php';
