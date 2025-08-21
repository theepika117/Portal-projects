import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class NotificationsScreen extends StatefulWidget {
  final String plantCode;
  final String plantName;

  const NotificationsScreen({
    Key? key,
    required this.plantCode,
    required this.plantName,
  }) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<dynamic>> _notificationsFuture;

  static const String baseUrl = "http://localhost:5000";

  Future<List<dynamic>> fetchNotifications() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/notifications'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'plant': widget.plantCode}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['notifications'] ?? [];
      } else {
        return [];
      }
    } catch (e) {
      print("Error fetching notifications: $e");
      return [];
    }
  }

  @override
  void initState() {
    super.initState();
    _notificationsFuture = fetchNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE1E8F0),
              image: DecorationImage(
                image: AssetImage('Assets/Background-image.png'),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.white.withOpacity(0.1),
                  BlendMode.dstATop,
                ),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back,
                            color: Color(0xFF9068BE)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Notifications - ${widget.plantName}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9068BE),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: FutureBuilder<List<dynamic>>(
                    future: _notificationsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFF7DCE94),
                          ),
                        );
                      } else if (snapshot.hasError) {
                        return Center(
                          child: Text('Error: ${snapshot.error}',
                              style: TextStyle(color: Colors.red)),
                        );
                      } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                        return const Center(
                          child: Text(
                            'No notifications found',
                            style: TextStyle(
                              fontSize: 16,
                              color: Color(0xFF9068BE),
                            ),
                          ),
                        );
                      } else {
                        final notifications = snapshot.data!;
                        return ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: notifications.length,
                          itemBuilder: (context, index) {
                            final notif = notifications[index];
                            return _buildNotificationCard(notif);
                          },
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notif) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 5,
            spreadRadius: 2,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Notification #${notif['NotificationNum'] ?? ''}",
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF9068BE),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            notif['Text'] ?? "No description",
            style: const TextStyle(fontSize: 14, color: Colors.black87),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.priority_high, size: 16, color: Colors.redAccent),
              const SizedBox(width: 4),
              Text("Priority: ${notif['Priorty'] ?? '-'}"),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.build, size: 16, color: Color(0xFF6ED3CF)),
              const SizedBox(width: 4),
              Text("Equipment: ${notif['EqupNum'] ?? '-'}"),
            ],
          ),
        ],
      ),
    );
  }
}
