<?php

namespace App\Http\Controllers;

use App\Models\CmsStatus;
use App\Models\MainData;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Maatwebsite\Excel\Facades\Excel;

class DataController extends Controller
{
     public function dashboard(Request $request)
    {
        $user = auth()->user();
        $user_data = User::find(Auth::user()->id);
        $query = MainData::with(['username'])->select(
            'mid',
            'name',
            'email',
            'phone',
            'ActulQuery',
            'title_page',
            'state',
            'calls',
            'mails',
            'watsp',
            'status',
            'date',
            'status_u_id',
            'q_type',
            'data_type'
        )->orderBy('date', 'desc');

        // Apply date range filter
        $FILTER = false;
        if ($request->has('start_date') && $request->has('end_date') && !empty($request->get('start_date')) && !empty($request->get('end_date'))) {
            $FILTER = true;
            $startDate = Carbon::parse($request->get('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->get('end_date'))->endOfDay();

            if ($user->role == 1) {
                // Super admin: can select any date range
                $query->whereBetween('date', [$startDate, $endDate]);
            } else {
                if ($user_data->all_data == 0) {
                    $date30DaysAgo = now()->subDays(30);
                    if ($startDate < $date30DaysAgo) {
                        $startDate = $date30DaysAgo;
                    }

                    $query->whereBetween('date', [$startDate, $endDate])
                        ->where('date', '>=', $date30DaysAgo);
                }
            }
        } else {
            // Apply default filter for non-admin users
            if ($user->role != 1) {
                if ($user_data->all_data == 0) {
                    $date30DaysAgo = now()->subDays(30);
                    $query->where('date', '>=', $date30DaysAgo);
                }
            }
        }

        // Apply search functionality
        if ($request->has('search') && !empty($request->get('search'))) {
            $FILTER = true;
            $search = $request->get('search');
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('title_page', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }
        if ($request->has('user') && !empty($request->get('user'))) {
            $FILTER = true;
            if ($user->role == 1) {
                $userid = $request->get('user');
                $query->where('status_u_id', $userid);
            }
        }
        if ($request->has('data_type') && !empty($request->get('data_type'))) {
            $FILTER = true;
            $data_type = $request->get('data_type');
            $query->where('data_type', $data_type);
        }
        if ($request->has('status') && !empty($request->get('status'))) {
            $FILTER = true;
            $status = $request->get('status');
            $query->where('status', $status);
        }

        // Apply any additional filters
        if ($request->has('filter')) {
            $FILTER = true;
            $filter = $request->get('filter');
            switch ($filter) {
                case 'google':
                    $query->where('data_type', 0); // Assuming 0 represents Google data
                    break;
                case 'facebook':
                    $query->where('data_type', 1); // Assuming 1 represents Facebook data
                    break;
                // Add more cases as needed
            }
        }

        // Fetch data with a limit
        if ($FILTER) {
            set_time_limit(300);
            $mainData = $query->get();
        } else {

            $mainData = $query->take(2000)->get();
        }
        $user = User::all();
        $current_time = Carbon::now();
        $ten_minutes_ago = $current_time->copy()->subMinutes(3);
        $ten_minutes_later = $current_time->copy()->addMinutes(3);
        $follow_ups = MainData::where('status_u_id', Auth::user()->id)
            ->whereBetween('follow_up_date', [$ten_minutes_ago, $ten_minutes_later])
            ->take(1)
            ->get();
        $today = Carbon::today();
        $followUpsToday = MainData::whereDate('follow_up_date', $today)
            ->where('status_u_id', Auth::user()->id)
            ->get();

        return Inertia::render('AllData', [
            'data' => $mainData,
            'filter' => $filter ?? '',
            'user' => $user,
            'follow_ups' => $follow_ups,
            'followUpsToday' => $followUpsToday,
        ]);
    }

    public function edit($id)
    {
        $data = MainData::with(['username'])->findOrFail($id);
        $cmsLog = CmsStatus::where("cms_id", $id)->orderBy("date", "desc")->get();
        return Inertia::render("Update", ["data" => $data, "cmsLog" => $cmsLog]);
    }

    public function update(Request $request)
    {

        $tid = $request->input('tid');
        $callss = $request->input('pcalls') ?? "";
        $mailss = $request->input('pmails', '') ?? "";
        $watsp = $request->input('pwatsp') ?? "";
        $fstatus = $request->input('fstatus');
        $status = $request->input('pstatus');
        $remark = $request->input('premark');
        $cl = $request->input('pcl') ?? "";
        $status_u_id = Auth::id();
        $callback = $request->input('callback_datetime');
        $status_date_time = $request->input('status_datetime');
        $state = $request->input('state');
        $PaymentStatus = $request->input('PaymentStatus');
        $PaymentAmount = $request->input('PaymentAmount');
        $attempt = $request->input('attempt');
        $ActulQuery = $request->input('ActulQuery');
        $follow_up_date = $request->input('follow_up_date');
        $email = $request->input('email');
        $call_dur = $request->input('call_dur');
        if ($fstatus) {
            $status = $fstatus;
        }

        MainData::where('mid', $tid)->update([
            'calls' => $callss,
            'mails' => $mailss,
            'watsp' => $watsp,
            'status' => $status,
            'remark' => $remark,
            'status_u_id' => $status_u_id,
            'callback_date' => $callback,
            'hotlead' => $cl,
            'state' => $state,
            'PaymentStatus' => $PaymentStatus,
            'PaymentAmount' => $PaymentAmount,
            'ActulQuery' => $ActulQuery,
            'follow_up_date' => $follow_up_date,
            'email' => $email,
        ]);
        CmsStatus::create([
            'cms_id' => $tid,
            'status' => $status,
            'date' => $status_date_time,
            'remark' => $remark,
            'call_dur' => $call_dur,
            'attempt' => $attempt,
        ]);

        return redirect()->back()->with('success', 'Data updated successfully');
    }
    public function delete(Request $request)
    {
        $id = $request->input('id');
        MainData::find($id)->delete();

        return redirect()->back()->with('success', 'Record deleted successfully.');
    }

    public function add_data(Request $request)
    {
        $callss = $request->input('pcalls') ?? "";
        $mailss = $request->input('pmails', '') ?? "";
        $watsp = $request->input('pwatsp') ?? "";
        $cl = $request->input('pcl') ?? "";
        $follow_up_date = $request->input('follow_up_date');
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|max:255',
            'cur_date' => 'required',
            'etype' => 'required',
            'data_f' => 'required',
            'pstatus' => 'required',
            'premark' => 'required',
        ]);


        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        if ($request->input("pstatus") == "Unallotted") {

            $user_id = null;
        } else {
            $user_id = Auth::user()->id;
        }
        $status = $request->input('pstatus');
        $fstatus = $request->input('fstatus');
        if ($fstatus) {
            $status = $fstatus;
        }
        $mainData = MainData::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'date' => $request->input('cur_date'),
            'title_page' => $request->input('etype'),
            'state' => $request->input('state'),
            'data_type' => $request->input('data_f'),
            'status' => $status,
            'remark' => $request->input('premark'),
            'status_u_id' => $user_id,
            "message" => "",
            'calls' => $callss,
            'mails' => $mailss,
            'watsp' => $watsp,
            "add_data" => 1,
            'follow_up_date' => $follow_up_date,
            'hotlead' => $cl
        ]);

        // Now you can use $mainData->id as $tid
        $tid = $mainData->mid;
        CmsStatus::create([
            'cms_id' => $tid,
            'status' => $request->input('pstatus'),
            'date' => $request->input('cur_date'),
            'remark' => $request->input('premark'),
            'call_dur' => 0,
            'attempt' => 0,
        ]);

        return redirect()->route('all.data')->with('success', 'Data added successfully');
    }

    public function followup()
    {
        $user = auth()->user();
        $today = Carbon::tomorrow();
        $sevenDaysAgo = Carbon::today()->subDays(15);

        $query = MainData::select(
            'mid',
            'name',
            'email',
            'phone',
            'ActulQuery',
            'title_page',
            'calls',
            'mails',
            'watsp',
            'data_type',
            'status',
            'date',
            'status_u_id',
            'follow_up_date',
        )
            ->whereBetween('follow_up_date', [$sevenDaysAgo, $today]) // Fetch data from 7 days back to today
            ->orderBy('date', 'desc');

        if (Auth::user()->role != 1) {
            $date7DaysAgo = now()->subDays(7);
            $query->where(function ($subQuery) use ($date7DaysAgo, $user) {
                $subQuery->where('date', '>=', $date7DaysAgo)
                    ->Where('status_u_id', Auth::user()->id);
            });
        }
        $mainData = $query->take(2000)->get();
        $title = "Follow Up";

        return view("followup", ["data" => $mainData, "title" => $title]);
    }
    public function chart(Request $request)
    {
        if (Auth::user()->role != 1 && Auth::user()->role != 2 && Auth::user()->role != 4) {
            return redirect("/");
        }
        $query = MainData::selectRaw('title_page, COUNT(*) as count')
            ->groupBy('title_page');
        $query2 = MainData::selectRaw('title_page, COUNT(*) as count')
            ->whereNull("status_u_id")
            ->whereDate('date', '>=', now()->subDays(30))
            ->groupBy('title_page');

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = $request->input('start_date') . ' 00:00:00'; // Start of the day
            $endDate = $request->input('end_date') . ' 23:59:59'; // End of the day
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        $data = $query->get();
        $unmarkedQuery = $query2->get();
        $top5 = MainData::selectRaw('title_page, COUNT(*) as count')
            ->groupBy('title_page')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        $fbquey = MainData::where("data_type", 1)->count();
        $ogquey = MainData::where("data_type", 0)->count();

        $totalRecords = MainData::count();
        $blankStatusCount = MainData::whereNull('status')->orWhere('status', '')->count();
        $nonBlankStatusCount = MainData::whereNotNull('status')->where('status', '<>', '')->count();
        $blankStatusPercentage = ($totalRecords > 0) ? ($blankStatusCount / $totalRecords) * 100 : 0;
        $nonBlankStatusPercentage = ($totalRecords > 0) ? ($nonBlankStatusCount / $totalRecords) * 100 : 0;


        $thirtyDaysAgo = Carbon::now()->subDays(30); // Get the date 30 days ago
        $today = Carbon::now(); // Today's date

        $totalEntriesLast30Days = MainData::whereBetween('date', [$thirtyDaysAgo, $today])->count();
        $emptyStatusCountLast30Days = MainData::whereBetween('date', [$thirtyDaysAgo, $today])
            ->whereNull('status')
            ->orWhere('status', '')
            ->count();
        $filledStatusCountLast30Days = MainData::whereBetween('date', [$thirtyDaysAgo, $today])
            ->whereNotNull('status')
            ->where('status', '<>', '')
            ->count();

        $emptyStatusPercentageLast30Days = ($totalEntriesLast30Days > 0) ? ($emptyStatusCountLast30Days / $totalEntriesLast30Days) * 100 : 0;
        $filledStatusPercentageLast30Days = ($totalEntriesLast30Days > 0) ? ($filledStatusCountLast30Days / $totalEntriesLast30Days) * 100 : 0;


        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;
        $monthlyData = MainData::selectRaw('MONTH(date) as month, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->where('add_data', 0)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('count', 'month')
            ->toArray();
        // Fill in missing months with 0 count
        $monthlyCounts = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyCounts[] = $monthlyData[$i] ?? 0;
        }
        $monthlywhAddDatacount = MainData::selectRaw('MONTH(date) as month, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->where('add_data', 1)
            ->groupBy('month')
            ->orderBy('month')
            ->where("data_type", 2)
            ->get()
            ->pluck('count', 'month')
            ->toArray();

        $monthlywhAddData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlywhAddData[] = $monthlywhAddDatacount[$i] ?? 0;
        }

        $monthlyIVRAddDatacount = MainData::selectRaw('MONTH(date) as month, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->where('add_data', 1)
            ->groupBy('month')
            ->orderBy('month')
            ->where("data_type", 3)
            ->get()
            ->pluck('count', 'month')
            ->toArray();

        $monthlyIVRAddData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyIVRAddData[] = $monthlyIVRAddDatacount[$i] ?? 0;
        }
        $monthlyNormalAddDatacount = MainData::selectRaw('MONTH(date) as month, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->where('add_data', 1)
            ->groupBy('month')
            ->orderBy('month')
            ->where("data_type", 4)
            ->get()
            ->pluck('count', 'month')
            ->toArray();

        $monthlyNormalAddData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyNormalAddData[] = $monthlyNormalAddDatacount[$i] ?? 0;
        }

        $dayWiseData = MainData::selectRaw('DAY(date) as day, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->where("add_data", 0)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();
        $daysInMonth = Carbon::now()->daysInMonth;
        $dailyCounts = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dailyCounts[] = $dayWiseData[$i] ?? 0;
        }

        $dayWiseaddData = MainData::selectRaw('DAY(date) as day, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->where("add_data", 1)
            ->where("data_type", 2)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();
        $dailyAddCounts = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dailyAddCounts[] = $dayWiseaddData[$i] ?? 0;
        }
        $dayWiseIVRaddData = MainData::selectRaw('DAY(date) as day, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->where("add_data", 1)
            ->where("data_type", 3)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();
        $dailyivrAddCounts = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dailyivrAddCounts[] = $dayWiseIVRaddData[$i] ?? 0;
        }
        $dayWiseNormaladdData = MainData::selectRaw('DAY(date) as day, COUNT(*) as count')
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->where("add_data", 1)
            ->where("data_type", 4)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();
        $dailyNormalAddCounts = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dailyNormalAddCounts[] = $dayWiseNormaladdData[$i] ?? 0;
        }
        $currentDate = Carbon::now()->toDateString();
        $hourlyData = MainData::selectRaw('HOUR(date) as hour, COUNT(*) as count')
            ->whereDate('date', $currentDate)
            ->where("add_data", 0)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('count', 'hour')
            ->toArray();

        // Fill in missing hours with 0 count
        $hourlyCounts = [];
        for ($i = 0; $i < 24; $i++) {
            $hourlyCounts[] = $hourlyData[$i] ?? 0;
        }

        $hourlyaddData = MainData::selectRaw('HOUR(date) as hour, COUNT(*) as count')
            ->whereDate('date', $currentDate)
            ->where("add_data", 1)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('count', 'hour')
            ->toArray();

        // Fill in missing hours with 0 count
        $hourlyAddCounts = [];
        for ($i = 0; $i < 24; $i++) {
            $hourlyAddCounts[] = $hourlyaddData[$i] ?? 0;
        }

        return Inertia::render("Chart", [
            "data" => $data,
            "top5" => $top5,
            "fbquey" => $fbquey,
            "ogquey" => $ogquey,
            'blankStatusPercentage' => $blankStatusPercentage,
            'monthlyCounts' => $monthlyCounts,
            'monthlywhAddData' => $monthlywhAddData,
            'monthlyIVRAddData' => $monthlyIVRAddData,
            'monthlyNormalAddData' => $monthlyNormalAddData,
            'nonBlankStatusPercentage' => $nonBlankStatusPercentage,
            'emptyStatusPercentageLast30Days' => $emptyStatusPercentageLast30Days,
            'filledStatusPercentageLast30Days' => $filledStatusPercentageLast30Days,
            'dailyCounts' => $dailyCounts,
            'dailyAddCounts' => $dailyAddCounts,
            'dailyivrAddCounts' => $dailyivrAddCounts,
            'dailyNormalAddCounts' => $dailyNormalAddCounts,
            'hourlyCounts' => $hourlyCounts,
            'hourlyAddCounts' => $hourlyAddCounts,
            "unmarkedQuery" => $unmarkedQuery
        ]);
    }

    public function allData()
    {

        //    $password = 'Seo@123';
        //    $hashpassword = Hash::make($password);
        //    echo $hashpassword; die;

        $data = MainData::select(
            'mid',
            'name',
            'email',
            'phone',
            'ActulQuery',
            'title_page',
            'calls',
            'q_type',
            'mails',
            'state',
            'watsp',
            'status',
            'date',
            'status_u_id'
        )->orderBy('date', 'desc')->paginate(20);

        return view("all-data", ["data" => $data]);
    }
    public function unmarked($query)
    {
        Artisan::call('view:clear');
        $query2 = MainData::whereNull('status_u_id')
            ->orderBy('date', 'desc')
            ->where('title_page', $query);
        $data = $query2->get();
        $title = $query;

        return Inertia::render('header-pages/hot-leads', compact('data', 'title'));
    }
    public function myDashboard()
    {
        $user = auth()->user()->id;
        $query = MainData::select(
            'Mid',
            'name',
            'email',
            'phone',
            'ActulQuery',
            'add_data',
            'title_page',
            'calls',
            'mails',
            'watsp',
            'status',
            'date'
        )->where("status_u_id", $user)->orderBy('date', 'desc');

        // If the user role is not 1, limit data to the past 30 days
        if (Auth::user()->all_data != 1 && Auth::user()->role != 1) {
            $date30DaysAgo = now()->subDays(30);
            $query->whereDate('date', '>=', $date30DaysAgo);
        }



        $mainData = $query->take(2000)->get();

        // Status counts (include all or restricted data based on role)
        $statusCounts = MainData::where("status_u_id", $user)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        // Status counts for the last 30 days only
        $statusCounts30days = MainData::where("status_u_id", $user)
            ->whereDate('date', '>=', now()->subDays(30))
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');
        // dd($statusCounts);
        return Inertia::render("MyDashboard", [
            "data" => $mainData,
            "statusCounts" => $statusCounts,
            "statusCounts30days" => $statusCounts30days,
        ]);
    }
    public function callback()
    {
        $user = auth()->user();
        $query = MainData::select(
            'mid',
            'name',
            'email',
            'phone',
            'ActulQuery',
            'title_page',
            'calls',
            'mails',
            'watsp',
            'status',
            'data_type',
            'date',
            'status_u_id'
        )
            ->whereNotNull("callback")
            ->where('callback', '<>', '')
            ->orderBy('date', 'desc');



        if ($user->role != 1) {
            $date7DaysAgo = now()->subDays(7);
            $query->where(function ($subQuery) use ($date7DaysAgo, $user) {
                $subQuery->where('date', '>=', $date7DaysAgo)
                    ->orWhere('status_u_id', $user->id);
            })->where("status_u_id", $user->id);
        }
        // Fetch data with a limit
        $mainData = $query->take(2000)->get();

        $title = "Callback";

        return view("hot-leads", ["data" => $mainData, "title" => $title]);
    }

    public function searchData(Request $request)
    {
        $searchTerm = $request->input('search');
        $query = MainData::query();

        if ($searchTerm) {
            $query->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('phone', 'like', "%{$searchTerm}%")
                    ->orWhere('title_page', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%");
            });
        }

        $data = $query->orderBy('date', 'desc')->paginate(20);

        return view('all-data', ['data' => $data, 'searchTerm' => $searchTerm]);
    }

    public function puData()
    {
        $response = Http::withHeaders([
            'X-API-KEY' => 'fFXKDHGhfzIx'
        ])->get('https://crm.professionalutilities.com/api/pu-data');

        $responseData = $response->json();
        $data = $responseData['data'] ?? [];
        // dd($data);
        return Inertia::render('PuData', ['data' => $data]);
    }
}
