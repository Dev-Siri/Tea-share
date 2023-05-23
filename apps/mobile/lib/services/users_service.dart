import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:tea_share/constants.dart';
import 'package:tea_share/env/secret_keys.dart' show BACKEND_URL;
import 'package:tea_share/models/user_model.dart';
import 'package:tea_share/utils/storage.dart';

class UsersServiceResponse {
  final bool successful;
  
  List<UserModel>? users;
  String? errorMessage;

  UsersServiceResponse({
    required this.successful,
    this.users,
    this.errorMessage,
  });
}

class UserService with Storage {
  final FirebaseAuth _firebaseAuth;

  UserService(this._firebaseAuth);
  
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json; charset=UTF-8',
  };

  User? get user => _firebaseAuth.currentUser;
  
  Future<void> updateProfile({ required UserModel user }) async {
    final StorageResponse imageResponse = await uploadImage(imagePath: user.image, type: "users");

    await _firebaseAuth.currentUser!.updateDisplayName(user.username);
    await _firebaseAuth.currentUser!.updateEmail(user.email);
    await _firebaseAuth.currentUser!.updatePhotoURL(imageResponse.imageUrl);

    await http.put(
      Uri.parse("$BACKEND_URL/user?id=${user.id}"),
      headers: _headers,
      body: jsonEncode({
        'username': user.username,
        'image': user.image,
        'email': user.email,
      })
    );
  }

  Future<void> _createUser(UserModel user) async => await http.post(
    Uri.parse("$BACKEND_URL/users"),
    headers: _headers,
    body: jsonEncode({
      'username': user.username,
      'email': user.email,
      'image': user.image,
    })
  );

  Future<void> signOut() async => _firebaseAuth.signOut();

  Future<UsersServiceResponse> login({ required String email, required String password }) async {
    try {
      await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
      return UsersServiceResponse(
        successful: true
      );
    } on FirebaseAuthException catch (error) {
      return UsersServiceResponse(
        successful: false,
        errorMessage: error.message
      );
    }
  }

  Future<UsersServiceResponse> signUp({ required String email, required String password, required String username }) async {
    try {
      await _firebaseAuth.createUserWithEmailAndPassword(email: email, password: password);
      await _firebaseAuth.currentUser?.updatePhotoURL(DEFAULT_IMAGE_URL);
      await _firebaseAuth.currentUser?.updateDisplayName(username);
      await _createUser(
        UserModel(
          email: email,
          image: DEFAULT_IMAGE_URL,
          username: username,
        )
      );
      
      return UsersServiceResponse(
        successful: true
      );
    } on FirebaseAuthException catch (error) {
      return UsersServiceResponse(
        successful: false,
        errorMessage: error.message
      );
    }
  }

  Future<UsersServiceResponse> signInWithGoogle() async {
    try {
      await _firebaseAuth.signInWithProvider(GoogleAuthProvider());
      await _createUser(
        UserModel(
          username: _firebaseAuth.currentUser!.displayName!,
          email: _firebaseAuth.currentUser!.email!,
          image: _firebaseAuth.currentUser!.photoURL!,
        )
      );
      
      return UsersServiceResponse(
        successful: true
      );
    } on FirebaseAuthException catch (error) {
      return UsersServiceResponse(
        successful: false,
        errorMessage: error.message
      );
    }
  }

  Future<UsersServiceResponse> fetchUsers({ int? limit, int? page }) async {
    final http.Response response = await http.get(Uri.parse('$BACKEND_URL/users?page=$page&limit=$limit'));

    if (response.statusCode == 200) {
      final List body = jsonDecode(response.body);
      final List<UserModel> users = body.map((final user) => UserModel.fromJson(user)).toList();

      return UsersServiceResponse(
        successful: true,
        users: users
      );
    }

    return UsersServiceResponse(
      successful: false,
      errorMessage: 'Failed to get people.\nThe server responded with a status code of ${response.statusCode}'
    );
  }

  Future<UsersServiceResponse> fetchUserByName({ required String name, bool? exact = false }) async {
    final http.Response response = await http.get(Uri.parse('$BACKEND_URL/users/search?name=$name&exact=$exact'));

    if (response.statusCode == 200) {
      final List body = jsonDecode(response.body);
      final List<UserModel> users = body.map((final user) => UserModel.fromJson(user)).toList();

      return UsersServiceResponse(
        successful: true,
        users: users
      );
    }

    return UsersServiceResponse(
      successful: false,
      errorMessage: 'Failed to get user with name.\nThe server responded with a status code of ${response.statusCode}'
    );
  }
}