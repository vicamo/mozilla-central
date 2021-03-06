/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/*
 * The contents of this file are subject to the Netscape Public License
 * Version 1.0 (the "NPL"); you may not use this file except in
 * compliance with the NPL.  You may obtain a copy of the NPL at
 * http://www.mozilla.org/NPL/
 * 
 * Software distributed under the NPL is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the NPL
 * for the specific language governing rights and limitations under the
 * NPL.
 * 
 * The Initial Developer of this code under the NPL is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation.  All Rights
 * Reserved.
 */

#ifndef prmon_h___
#define prmon_h___

#include "prtypes.h"
#include "prinrval.h"

PR_BEGIN_EXTERN_C

typedef struct PRMonitor PRMonitor;

/*
** Create a new monitor. Monitors are re-entrant locks with a single built-in
** condition variable.
**
** This may fail if memory is tight or if some operating system resource
** is low.
*/
PR_EXTERN(PRMonitor*) PR_NewMonitor(void);

/*
** Destroy a monitor. The caller is responsible for guaranteeing that the
** monitor is no longer in use. There must be no thread waiting on the monitor's
** condition variable and that the lock is not held.
**
*/
PR_EXTERN(void) PR_DestroyMonitor(PRMonitor *mon);

/*
** Enter the lock associated with the monitor. If the calling thread currently
** is in the monitor, the call to enter will silently succeed. In either case,
** it will increment the entry count by one.
*/
PR_EXTERN(void) PR_EnterMonitor(PRMonitor *mon);

/*
** Decrement the entry count associated with the monitor. If the decremented
** entry count is zero, the monitor is exited. Returns PR_FAILURE if the
** calling thread has not entered the monitor.
*/
PR_EXTERN(PRStatus) PR_ExitMonitor(PRMonitor *mon);

/*
** Wait for a notify on the monitor's condition variable. Sleep for "ticks"
** amount of time (if "ticks" is PR_INTERVAL_NO_TIMEOUT then the sleep is
** indefinite).
**
** While the thread is waiting it exits the monitor (as if it called
** PR_ExitMonitor as many times as it had called PR_EnterMonitor).  When
** the wait has finished the thread regains control of the monitors lock
** with the same entry count as before the wait began.
**
** The thread waiting on the monitor will be resumed when the monitor is
** notified (assuming the thread is the next in line to receive the
** notify) or when the "ticks" timeout elapses.
**
** Returns PR_FAILURE if the caller has not entered the monitor.
*/
PR_EXTERN(PRStatus) PR_Wait(PRMonitor *mon, PRIntervalTime ticks);

/*
** Notify a thread waiting on the monitor's condition variable. If a thread
** is waiting on the condition variable (using PR_Wait) then it is awakened
** and attempts to reenter the monitor.
*/
PR_EXTERN(PRStatus) PR_Notify(PRMonitor *mon);

/*
** Notify all of the threads waiting on the monitor's condition variable.
** All of threads waiting on the condition are scheduled to reenter the
** monitor.
*/
PR_EXTERN(PRStatus) PR_NotifyAll(PRMonitor *mon);

PR_END_EXTERN_C

#endif /* prmon_h___ */
