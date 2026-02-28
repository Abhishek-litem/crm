<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsStatus extends Model
{
    use HasFactory;
    protected $table="cms_status";
    public $timestamps = false;
    protected $fillable = ['cms_id', "status", "date","remark","attempt","call_dur"];

    public function cms_data(){
        return $this->belongsTo(MainData::class,"cms_id", "id");
    }
}
