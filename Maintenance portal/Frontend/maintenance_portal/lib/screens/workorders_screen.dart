 // lib/screens/workorders_screen.dart
// lib/screens/workorders_screen.dart
import 'package:flutter/material.dart';
import '../services/workorders_service.dart';

class WorkOrdersScreen extends StatefulWidget {
  final String plantCode;
  final String plantName;

  const WorkOrdersScreen({
    Key? key,
    required this.plantCode,
    required this.plantName,
  }) : super(key: key);

  @override
  State<WorkOrdersScreen> createState() => _WorkOrdersScreenState();
}

class _WorkOrdersScreenState extends State<WorkOrdersScreen> {
  late Future<List<dynamic>> _workOrdersFuture;

  @override
  void initState() {
    super.initState();
    _workOrdersFuture = WorkOrdersService.fetchWorkOrders(widget.plantCode);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // optional: your background here for consistency
          SafeArea(
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Color(0xFF9068BE)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Work Orders - ${widget.plantName}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9068BE),
                        ),
                      ),
                    ],
                  ),
                ),
                // Content
                Expanded(
                  child: FutureBuilder<List<dynamic>>(
                    future: _workOrdersFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (snapshot.hasError) {
                        return Center(child: Text('Error: ${snapshot.error}'));
                      }
                      final workOrders = snapshot.data ?? [];
                      if (workOrders.isEmpty) {
                        return const Center(child: Text('No work orders found'));
                      }
                      return ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: workOrders.length,
                        itemBuilder: (context, i) {
                          final w = workOrders[i];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.2),
                                  spreadRadius: 2,
                                  blurRadius: 5,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: ListTile(
                              title: Text('Work Order #${w['OrderNum'] ?? ''}'),
                              subtitle: Text(w['Description'] ?? 'No description'),
                              trailing: Text(w['OrderType'] ?? ''),
                            ),
                          );
                        },
                      );
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
}























// import 'dart:convert';
// import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;

// class WorkOrdersScreen extends StatefulWidget {
//   final String plantCode;
//   final String plantName;

//   const WorkOrdersScreen({
//     Key? key,
//     required this.plantCode,
//     required this.plantName,
//   }) : super(key: key);

//   @override
//   State<WorkOrdersScreen> createState() => _WorkOrdersScreenState();
// }

// class _WorkOrdersScreenState extends State<WorkOrdersScreen> {
//   late Future<List<dynamic>> _workOrdersFuture;

//   static const String baseUrl = 'http://10.0.2.2:5000';

//   Future<List<dynamic>> fetchWorkOrders() async {
//     try {
//       final response = await http.post(
//         Uri.parse('$baseUrl/workorders'),
//         headers: {'Content-Type': 'application/json'},
//         body: json.encode({'plant': widget.plantCode}),
//       );

//       if (response.statusCode == 200) {
//         final data = json.decode(response.body);
//         return data['workorders'] ?? [];
//       } else {
//         return [];
//       }
//     } catch (e) {
//       return [];
//     }
//   }

//   @override
//   void initState() {
//     super.initState();
//     _workOrdersFuture = fetchWorkOrders();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: SafeArea(
//         child: Column(
//           children: [
//             // Header
//             Container(
//               padding: const EdgeInsets.all(20),
//               child: Row(
//                 children: [
//                   IconButton(
//                     icon: const Icon(Icons.arrow_back, color: Color(0xFF9068BE)),
//                     onPressed: () => Navigator.pop(context),
//                   ),
//                   const SizedBox(width: 10),
//                   Text(
//                     'Work Orders - ${widget.plantName}',
//                     style: const TextStyle(
//                       fontSize: 20,
//                       fontWeight: FontWeight.bold,
//                       color: Color(0xFF9068BE),
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//             // Content
//             Expanded(
//               child: FutureBuilder<List<dynamic>>(
//                 future: _workOrdersFuture,
//                 builder: (context, snapshot) {
//                   if (snapshot.connectionState == ConnectionState.waiting) {
//                     return const Center(child: CircularProgressIndicator());
//                   } else if (snapshot.hasError) {
//                     return Center(child: Text('Error: ${snapshot.error}'));
//                   } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
//                     return const Center(child: Text('No work orders found'));
//                   } else {
//                     final workOrders = snapshot.data!;
//                     return ListView.builder(
//                       padding: const EdgeInsets.all(16),
//                       itemCount: workOrders.length,
//                       itemBuilder: (context, index) {
//                         final wo = workOrders[index];
//                         return Card(
//                           margin: const EdgeInsets.only(bottom: 16),
//                           child: ListTile(
//                             title: Text("Work Order #${wo['OrderNum'] ?? ''}"),
//                             subtitle: Text(wo['Description'] ?? 'No description'),
//                             trailing: Text(wo['OrderType'] ?? ''),
//                           ),
//                         );
//                       },
//                     );
//                   }
//                 },
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
