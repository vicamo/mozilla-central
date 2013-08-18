/* -*- Mode: c++; c-basic-offset: 2; indent-tabs-mode: nil; tab-width: 40 -*- */
/* vim: set ts=2 et sw=2 tw=40: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_voicemail_voicemail_h__
#define mozilla_dom_voicemail_voicemail_h__

#include "mozilla/Attributes.h"
#include "mozilla/ErrorResult.h"
#include "nsDOMEvent.h"
#include "nsDOMEventTargetHelper.h"
#include "nsIVoicemailProvider.h"

struct JSObject;
struct JSContext;

class nsPIDOMWindow;
class nsIDOMMozVoicemailStatus;

namespace mozilla {
namespace dom {

class Voicemail MOZ_FINAL : public nsDOMEventTargetHelper
{
  /**
   * Class Voicemail doesn't actually inherit nsIVoicemailListener. Instead, it
   * owns an nsIVoicemailListener derived instance mListener and passes it to
   * nsIVoicemailProvider. The onreceived events are first delivered to
   * mListener and then forwarded to its owner, Voicemail. See also bug 775997
   * comment #51.
   */
  class Listener;

public:
  NS_DECL_ISUPPORTS_INHERITED
  NS_DECL_NSIVOICEMAILLISTENER

  NS_REALLY_FORWARD_NSIDOMEVENTTARGET(nsDOMEventTargetHelper)

  Voicemail(nsPIDOMWindow* aWindow, nsIVoicemailProvider* aProvider);

  virtual ~Voicemail();

  nsPIDOMWindow*
  GetParentObject() const
  {
    return GetOwner();
  }

  virtual JSObject*
  WrapObject(JSContext* aCx, JS::Handle<JSObject*> aScope) MOZ_OVERRIDE;

  already_AddRefed<nsIDOMMozVoicemailStatus>
  GetStatus(ErrorResult& aRv) const;

  void
  GetNumber(nsString& aNumber, ErrorResult& aRv) const;

  void
  GetDisplayName(nsString& aDisplayName, ErrorResult& aRv) const;

  IMPL_EVENT_HANDLER(statuschanged)

private:
  nsCOMPtr<nsIVoicemailProvider> mProvider;
  nsRefPtr<Listener> mListener;
};

} // namespace dom
} // namespace mozilla

nsresult
NS_NewVoicemail(nsPIDOMWindow* aWindow,
                mozilla::dom::Voicemail** aVoicemail);

#endif // mozilla_dom_voicemail_voicemail_h__
