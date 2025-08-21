// lib/services/notifications_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_base.dart';

class NotificationsService {
  static Future<List<dynamic>> fetchNotifications(String plant) async {
    final url = Uri.parse('${ApiBase.baseUrl}/notifications');
    try {
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'plant': plant}),
      );

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return (data['notifications'] as List?) ?? [];
      } else {
        // ignore: avoid_print
        print('Notifications error ${res.statusCode}: ${res.body}');
        return [];
      }
    } catch (e) {
      // ignore: avoid_print
      print('Notifications exception: $e');
      return [];
    }
  }
}















// import 'dart:convert';
// import 'package:http/http.dart' as http;

// class NotificationsService {
//   static const String baseUrl = 'http://10.0.2.2:5000'; // adjust for your env

//   static Future<Map<String, dynamic>> fetchNotifications(String plant) async {
//     try {
//       final response = await http.post(
//         Uri.parse('$baseUrl/notifications'),
//         headers: {'Content-Type': 'application/json'},
//         body: json.encode({'plant': plant}),
//       );

//       if (response.statusCode == 200) {
//         return json.decode(response.body);
//       } else {
//         return {'success': false, 'notifications': []};
//       }
//     } catch (e) {
//       return {'success': false, 'notifications': []};
//     }
//   }
// }
