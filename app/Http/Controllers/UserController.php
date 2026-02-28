<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function user()
    {
        $data = User::all();

        return Inertia::render('User', ['data' => $data,'csrf_token' => csrf_token(),]);
    }

    public function update(Request $request)
    {
        $user = User::find($request->input('id'));
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->role = $request->input('role');

        if ($request->input('password')) {
            $user->password = Hash::make($request->input('password'));
        }
        $user->save();

        return redirect()->route('user')->with('success', 'User updated successfully');
    }

    public function destroy(Request $request)
    {
        $user = User::find($request->input('id'));
        if ($user) {
            $user->delete();
        }

        return redirect()->route('user')->with('success', 'User deleted successfully');
    }

    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|integer',
        ]);

        // Create a new user with validated data
        $user = new User;
        $user->name = $validatedData['name'];
        $user->email = $validatedData['email'];
        $user->role = $validatedData['role'];
        $user->password = Hash::make($validatedData['password']);
        $user->save();

        // Redirect with success message
        return redirect()->route('user')->with('success', 'User added successfully');
    }

    public function updateCheckbox(Request $request)
    {
        $itemId = $request->input('id');
        $checked = $request->input('checked');

        // Update your item based on the received data
        $item = User::find($itemId);
        if ($item) {
            $item->all_data = $checked ? 1 : 0;
            $item->save();

            return response()->json(['success' => true]);
        } else {
            return response()->json(['success' => false], 404);
        }
    }

    // public function updateIvr(Request $request)
    // {
    //     $itemId = $request->input('id');
    //     $checked = $request->input('checked');

    //     // Update your item based on the received data
    //     $item = User::find($itemId);
    //     if ($item) {
    //         $item->IVR = $checked ? 1 : 0;
    //         $item->save();

    //         return response()->json(['success' => true]);
    //     } else {
    //         return response()->json(['success' => false], 404);
    //     }
    // }

    public function login()
    {
        $data = LoginLog::with(['username'])->orderBy('created_at', 'desc')->get();

        return Inertia::render('LoginDetails', compact('data'));
    }
}
