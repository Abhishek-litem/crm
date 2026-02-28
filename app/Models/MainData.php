<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MainData extends Model
{
    use HasFactory;
    protected $table = 'main_table';
    protected $primaryKey = 'mid';


    public $timestamps = false;
    protected $fillable = [
        'name',
        'email',
        'phone',
        'date',
        'q_type',
        'title_page',
        'state',
        'data_f',
        'status',
        'remark',
        'u_id',
        'message',
        "calls",
        "mails",
        "watsp",
        "e_count",
        'status_u_id',
        'add_data',
        "PaymentStatus",
        "data_type",
        "PaymentAmount",
        "ActulQuery",
        "follow_up_date",
        "hotlead"
    ];

    public function username()
    {
        return $this->belongsTo(User::class, "status_u_id", "id");
    }
    public function cmsStatuses()
    {
        return $this->hasMany(CmsStatus::class, 'cms_id', 'mid');
    }
}
