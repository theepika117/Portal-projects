import 'package:flutter/material.dart';
import 'package:maintenance_portal/screens/loading_screen.dart';
import 'package:maintenance_portal/screens/login_screen.dart';
import 'package:maintenance_portal/screens/plants_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Maintenance Portal',
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: const Color(0xFFE1E8F0),
        colorScheme: ColorScheme.fromSwatch(
          primarySwatch: Colors.green,
          accentColor: const Color(0xFF7DCE94),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoadingScreen(),
        '/login': (context) => const LoginScreen(),
        '/plants': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          final employeeId = args?['employeeId'] as String? ?? '';
          return PlantsScreen(employeeId: employeeId);
        },
      },
    );
  }
}
