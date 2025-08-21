import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_base.dart';

class AuthService {
  final String baseUrl = ApiBase.baseUrl;
  
  Future<Map<String, dynamic>> login({
    required String empId,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'empId': empId,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'user': data['user'],
        };
      } else if (response.statusCode == 401) {
        return {
          'success': false,
          'message': 'Invalid credentials',
        };
      } else {
        return {
          'success': false,
          'message': 'Server error: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error: ${e.toString()}',
      };
    }
  }
}















// import 'dart:convert';
// import 'package:http/http.dart' as http;

// class AuthService {
//   static const String baseUrl = 'http://localhost:5000';
  
//   Future<Map<String, dynamic>> login({
//     required String empId,
//     required String password,
//   }) async {
//     try {
//       final response = await http.post(
//         Uri.parse('$baseUrl/login'),
//         headers: {'Content-Type': 'application/json'},
//         body: jsonEncode({
//           'empId': empId,
//           'password': password,
//         }),
//       );

//       if (response.statusCode == 200) {
//         final data = jsonDecode(response.body);
//         return {
//           'success': true,
//           'user': data['user'],
//         };
//       } else if (response.statusCode == 401) {
//         return {
//           'success': false,
//           'message': 'Invalid credentials',
//         };
//       } else {
//         return {
//           'success': false,
//           'message': 'Server error: ${response.statusCode}',
//         };
//       }
//     } catch (e) {
//       return {
//         'success': false,
//         'message': 'Connection error: ${e.toString()}',
//       };
//     }
//   }
// }
