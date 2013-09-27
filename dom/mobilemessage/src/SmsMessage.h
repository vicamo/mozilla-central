/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_mobilemessage_SmsMessage_h
#define mozilla_dom_mobilemessage_SmsMessage_h

#include "mozilla/dom/mobilemessage/SmsTypes.h"
#include "nsIDOMMozSmsMessage.h"
#include "nsString.h"
#include "mozilla/dom/Date.h"
#include "mozilla/dom/mobilemessage/Types.h"
#include "mozilla/Attributes.h"

namespace mozilla {
namespace dom {

class SmsMessage MOZ_FINAL : public nsIDOMMozSmsMessage
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIDOMMOZSMSMESSAGE

  SmsMessage(const mobilemessage::SmsMessageData& aData);

  static nsresult
  Create(int32_t aId,
         const uint64_t aThreadId,
         const nsAString& aDelivery,
         const nsAString& aDeliveryStatus,
         const nsAString& aSender,
         const nsAString& aReceiver,
         const nsAString& aBody,
         const nsAString& aMessageClass,
         const JS::Value& aTimestamp,
         const bool aRead,
         JSContext* aCx,
         nsIDOMMozSmsMessage** aMessage);

  const mobilemessage::SmsMessageData&
  GetData() const
  {
    return mData;
  }

  // WebIDL Interface
  int32_t
  Id() const
  {
    return mData.id();
  }

  uint64_t
  ThreadId() const
  {
    return mData.threadId();
  }

  Date
  Timestamp() const
  {
    return mData.timestamp();
  }

  bool
  Read() const
  {
    return mData.read();
  }

private:
  // Don't try to use the default constructor.
  SmsMessage();

  mobilemessage::SmsMessageData mData;
};

} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_mobilemessage_SmsMessage_h
