export type PublishKeyRequestDto = {
  flow: {
    channelSetId: string;
  },
  initData: {
    amount: number;
    deliveryFee: number;
  };
};

export type PublishKeyResponseDto = {
  flow: {
    country: string;
    currency: string;
  };
  initData: {
    publishKey: string;
    totalCharge: number;
  };
};
