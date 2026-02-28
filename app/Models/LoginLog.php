<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'ip_address',
        'logged_in_at',
    ];

    public function username(){
        return $this->belongsTo(User::class,"user_id", "id");
    }
}
