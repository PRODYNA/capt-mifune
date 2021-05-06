package com.prodyna.json.converter;

import java.util.concurrent.Flow.Subscriber;
import java.util.concurrent.Flow.Subscription;

public class PrintSubscriber<T> implements Subscriber<T> {

  private Subscription subscription;

  @Override
  public void onSubscribe(Subscription subscription) {
    this.subscription = subscription;
    this.subscription.request(1);
  }

  @Override
  public void onNext(T item) {
    System.out.println("print item");
    System.out.println(item);
    this.subscription.request(1);
  }

  @Override
  public void onError(Throwable throwable) {
    throwable.printStackTrace();
  }

  @Override
  public void onComplete() {
    System.out.println("print done");
  }
}
