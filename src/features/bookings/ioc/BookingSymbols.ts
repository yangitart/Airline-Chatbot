export const BookingSymbols = {
  dataSource: Symbol("BookingDataSource"),
  repository: Symbol("BookingRepository"),
  createDemoBookingUseCase: Symbol("CreateDemoBookingUseCase"),
  listMyBookingsUseCase: Symbol("ListMyBookingsUseCase"),
  getMyBookingUseCase: Symbol("GetMyBookingUseCase"),
} as const;
