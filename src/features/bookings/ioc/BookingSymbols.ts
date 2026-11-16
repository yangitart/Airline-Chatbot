export const BookingSymbols = {
  actionsDataSource: Symbol("BookingActionsDataSource"),
  actionsRepository: Symbol("BookingActionsRepository"),
  createCheckoutUseCase: Symbol("CreateCheckoutUseCase"),
  checkInUseCase: Symbol("CheckInBookingUseCase"),
  dataSource: Symbol("BookingDataSource"),
  repository: Symbol("BookingRepository"),
  createDemoBookingUseCase: Symbol("CreateDemoBookingUseCase"),
  listMyBookingsUseCase: Symbol("ListMyBookingsUseCase"),
  getMyBookingUseCase: Symbol("GetMyBookingUseCase"),
} as const;
