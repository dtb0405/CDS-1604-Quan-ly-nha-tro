// Enhanced Chatbot Training Data - Accurate & Comprehensive

export const getChatbotResponse = (userMessage) => {
  const msg = userMessage.toLowerCase().trim();
  
  // ============== GREETINGS ==============
  if (msg.match(/(chào|hello|hi|xin chào|alo|hey)/)) {
    return 'Xin chào! 👋 Tôi là trợ lý ảo của hệ thống quản lý nhà trọ.\n\n💡 Tôi có thể giúp bạn:\n• Thông tin giá phòng & dịch vụ 💰\n• Hướng dẫn thanh toán hóa đơn 💳\n• Cách gửi phản hồi/khiếu nại 📝\n• Quy định và nội quy 📋\n• Liên hệ & hỗ trợ 📞\n\nBạn cần hỗ trợ gì? Cứ hỏi thoải mái nhé! 😊';
  }
  
  // ============== PRICING - ROOM ==============
  if (msg.match(/(giá phòng|giá thuê|tiền phòng|chi phí phòng)/)) {
    return '💰 Bảng giá phòng trọ:\n\n🏠 Phòng đơn (20-25m²): 1.500.000 - 2.000.000đ/tháng\n🏠 Phòng đôi (30-35m²): 2.500.000 - 3.000.000đ/tháng\n\n📍 Giá tùy thuộc vào:\n• Diện tích phòng\n• Vị trí (gần cầu thang/thang máy)\n• Hướng phòng (thoáng mát)\n• Nội thất có sẵn\n\n💡 Xem chi tiết tất cả phòng trống trên Trang chủ hoặc liên hệ chủ trọ để được tư vấn! 📞';
  }
  
  // ============== UTILITIES - ELECTRIC ==============
  if (msg.match(/(giá điện|tiền điện|chi phí điện)/) && !msg.includes('nước')) {
    return '⚡ Thông tin điện năng:\n\n💵 Giá điện: 3.500đ/kWh\n📊 Tính theo chỉ số công tơ thực tế\n📅 Ghi chỉ số: Đầu mỗi tháng (ngày 1-3)\n🔢 Công thức: (Chỉ số mới - Chỉ số cũ) × 3.500đ\n\n💡 Ví dụ: Dùng 100 kWh = 100 × 3.500 = 350.000đ\n\n📱 Xem chi tiết tiêu thụ trong mục "Hóa đơn của tôi"!\n⚠️ Nhớ tắt thiết bị khi không dùng để tiết kiệm điện nhé!';
  }
  
  // ============== UTILITIES - WATER ==============
  if (msg.match(/(giá nước|tiền nước|chi phí nước)/) && !msg.includes('điện')) {
    return '💧 Thông tin nước sinh hoạt:\n\n💵 Giá nước: 20.000đ/m³ (khối)\n📊 Tính theo đồng hồ nước cá nhân\n📅 Ghi chỉ số: Đầu mỗi tháng (ngày 1-3)\n🔢 Công thức: (Chỉ số mới - Chỉ số cũ) × 20.000đ\n\n💡 Ví dụ: Dùng 5m³ = 5 × 20.000 = 100.000đ\n\n📱 Theo dõi mức tiêu thụ trong "Hóa đơn của tôi"!\n💚 Sử dụng nước tiết kiệm để bảo vệ môi trường!';
  }
  
  // ============== BOTH UTILITIES ==============
  if (msg.includes('điện') && msg.includes('nước')) {
    return '⚡💧 Bảng giá dịch vụ:\n\n⚡ ĐIỆN:\n• Giá: 3.500đ/kWh\n• Tính theo công tơ điện\n• Ví dụ: 100 kWh = 350.000đ\n\n💧 NƯỚC:\n• Giá: 20.000đ/m³\n• Tính theo đồng hồ nước\n• Ví dụ: 5m³ = 100.000đ\n\n📅 Ghi chỉ số: Đầu mỗi tháng (1-3)\n📊 Tính theo thực tế tiêu thụ\n💡 Xem chi tiết trong "Hóa đơn của tôi"!';
  }
  
  // Continue with other responses...
  // (Copy remaining responses from the comprehensive version above)
  
  // ============== DEFAULT ==============
  return '🤔 Xin lỗi, tôi chưa hiểu câu hỏi của bạn.\n\n💡 Bạn có thể hỏi về:\n\n💰 GIÁ CẢ:\n• "Giá phòng bao nhiêu?"\n• "Giá điện nước?"\n\n💳 THANH TOÁN:\n• "Cách thanh toán?"\n• "Xem hóa đơn ở đâu?"\n\n📝 PHẢN HỒI:\n• "Gửi phản hồi như thế nào?"\n• "Xem lịch sử phản hồi?"\n\n📋 QUY ĐỊNH:\n• "Nội quy là gì?"\n• "Giờ ra vào?"\n\n📞 Hoặc gọi hotline: 0987-654-321!';
};
