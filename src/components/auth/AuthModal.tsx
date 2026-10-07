import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useApp } from '../../context/AppContext';
import { TrustEntity, UserRole, DutyStation, DUTY_STATIONS } from '../../types';
import {
  recordAuditLog,
  COLLECTIONS,
  createOrUpdateHRUserProfile,
  ENTITY_DUTY_STATION_MAP,
} from '../../services/firebaseService';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Briefcase,
  X,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { authUser, userProfile, entities, departments, currentRole, switchRole } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<TrustEntity>('Mukisa Foundation');
  const [selectedDutyStation, setSelectedDutyStation] = useState<DutyStation>('Mukisa Foundation — Lungujja');
  const [selectedDept, setSelectedDept] = useState('Administration');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Employee');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);

  if (!isOpen) return null;

  const handleQuickAdminFill = () => {
    setEmail('nassozishamim50@gmail.com');
    setPassword('TrustAdmin@2026');
    setFullName('Shamim Nassodzi');
    setSelectedRole('System Administrator');
    setSelectedEntity('Mukisa Foundation');
    setSelectedDutyStation('Mukisa Foundation — Lungujja');
    setSelectedDept('Administration');
    setJobTitle('Lead Trust Systems Director');
    setPhone('+256 700 123456');
    setErrorMessage(null);
    setOperationNotAllowed(false);
    setSuccessMessage('Primary Administrator credentials filled! Click "Sign In" or "Register New User" to proceed.');
  };

  const handleEntityChange = (entity: TrustEntity) => {
    setSelectedEntity(entity);
    const matchedStation = ENTITY_DUTY_STATION_MAP[entity] || DUTY_STATIONS[0];
    setSelectedDutyStation(matchedStation);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setOperationNotAllowed(false);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      const cleanEmail = (user.email || '').toLowerCase();
      const isSystemAdmin = cleanEmail === 'nassozishamim50@gmail.com';
      const assignedRole: UserRole = isSystemAdmin ? 'System Administrator' : selectedRole;

      // Ensure full HR Profile and Employee Dossier are stored in Cloud Firestore
      await createOrUpdateHRUserProfile({
        userId: user.uid,
        fullName: user.displayName || fullName.trim() || (isSystemAdmin ? 'Shamim Nassodzi' : cleanEmail.split('@')[0] || 'Authorized User'),
        entity: selectedEntity || 'Mukisa Foundation',
        dutyStation: selectedDutyStation || 'Mukisa Foundation — Lungujja',
        department: selectedDept || 'Administration',
        jobTitle: jobTitle.trim() || (isSystemAdmin ? 'Lead Trust Systems Director' : 'HR Professional'),
        role: assignedRole,
        email: cleanEmail,
        phone: phone.trim() || user.phoneNumber || '+256 700 000000',
      });

      switchRole(assignedRole);

      await recordAuditLog(
        'Google Authentication',
        'Auth',
        `User ${user.email} authenticated via Google Auth with role ${assignedRole}.`,
        'users',
        user.uid
      );

      setSuccessMessage('Authentication successful! Welcome to Special Children\'s Trust HR.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (authError: any) {
      console.error('[Firebase Google Auth Error]:', {
        code: authError?.code,
        message: authError?.message,
        error: authError,
      });

      if (authError.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before completing authentication.');
      } else if (authError.code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(`Google sign-in error (${authError.code || 'unknown'}): ${authError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setOperationNotAllowed(false);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = cred.user;

      const isSystemAdmin = cleanEmail === 'nassozishamim50@gmail.com';

      // Update or ensure HR profile exists in Firestore
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await setDoc(userRef, { lastLoginAt: new Date().toISOString() }, { merge: true });
        const existingData = userSnap.data();
        if (existingData?.role) {
          switchRole(existingData.role as UserRole);
        }
      } else {
        // Create initial profile if first login
        const newProfile = await createOrUpdateHRUserProfile({
          userId: user.uid,
          fullName: user.displayName || (isSystemAdmin ? 'Shamim Nassodzi' : cleanEmail.split('@')[0]),
          entity: selectedEntity || "Special Children's Trust",
          dutyStation: selectedDutyStation || 'Mukisa Foundation — Lungujja',
          department: selectedDept || 'Administration',
          jobTitle: isSystemAdmin ? 'Lead Trust Systems Director' : 'Staff Member',
          role: isSystemAdmin ? 'System Administrator' : 'Employee',
          email: user.email || cleanEmail,
          phone: phone.trim() || '+256 700 000000',
        });
        switchRole(newProfile.role);
      }

      await recordAuditLog(
        'User Sign In',
        'Auth',
        `User ${user.email} authenticated via Firebase Auth successfully.`,
        'users',
        user.uid
      );

      setSuccessMessage('Authentication successful! Welcome to Special Children\'s Trust HR.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('[Firebase Auth Error] Sign in error:', {
        code: err?.code,
        message: err?.message,
        error: err,
      });

      if (err.code === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        setErrorMessage(
          'Email/Password sign-in provider is not enabled in this Firebase project (ferrous-service-1vr20). Please enable it in Firebase Console or use "Continue with Google" below.'
        );
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setErrorMessage(
          'Invalid credentials or account not yet registered in Firebase Auth. If this is your first time logging in, switch to "Register New User" tab below to create your account.'
        );
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily blocked due to multiple failed attempts. Please try again shortly.');
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMessage('Network error: Could not reach Firebase Authentication servers. Check internet connection.');
      } else {
        setErrorMessage(err?.message ? `Sign in error: ${err.message}` : 'Authentication error occurred. Please check network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setOperationNotAllowed(false);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      let activeUser = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        activeUser = cred.user;
      } catch (authError: any) {
        console.error('[Firebase Auth Error] createUserWithEmailAndPassword failed:', {
          code: authError?.code,
          message: authError?.message,
          error: authError,
        });

        if (authError.code === 'auth/email-already-in-use') {
          // Account already exists in Firebase Auth; seamlessly authenticate
          try {
            const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            activeUser = loginCred.user;
          } catch (loginErr: any) {
            console.error('[Firebase Auth Error] Existing account sign-in fallback failed:', loginErr);
            setErrorMessage(
              'An account already exists with this email address. Please switch to the "Sign In" tab to authenticate with your password.'
            );
            setLoading(false);
            return;
          }
        } else if (authError.code === 'auth/operation-not-allowed') {
          setOperationNotAllowed(true);
          setErrorMessage(
            'Email/Password sign-in provider is not enabled in this Firebase project (ferrous-service-1vr20). Enable "Email/Password" in Firebase Console or use "Continue with Google" below.'
          );
          setLoading(false);
          return;
        } else {
          // Provide diagnostic detail
          let displayMsg = 'Registration could not be completed.';
          if (authError.code === 'auth/weak-password') {
            displayMsg = 'Password is too weak. Please use at least 6 characters.';
          } else if (authError.code === 'auth/invalid-email') {
            displayMsg = 'The email address provided is invalid.';
          } else if (authError.code === 'auth/network-request-failed') {
            displayMsg = 'Network error: Unable to connect to Firebase. Please check your network connection.';
          } else if (authError.code === 'auth/too-many-requests') {
            displayMsg = 'Access blocked due to multiple attempts. Please try again in a few moments.';
          } else if (authError.message) {
            displayMsg = `Firebase error (${authError.code || 'unknown'}): ${authError.message}`;
          }
          setErrorMessage(displayMsg);
          setLoading(false);
          return;
        }
      }

      if (!activeUser) {
        setErrorMessage('Authentication session could not be established.');
        setLoading(false);
        return;
      }

      // Check if this is the bootstrapped administrator
      const isSystemAdmin = cleanEmail === 'nassozishamim50@gmail.com';
      const assignedRole: UserRole = isSystemAdmin ? 'System Administrator' : selectedRole;

      // Automatically create user HR profile and dossier in Cloud Firestore
      await createOrUpdateHRUserProfile({
        userId: activeUser.uid,
        fullName: fullName.trim() || (isSystemAdmin ? 'Shamim Nassodzi' : cleanEmail.split('@')[0]),
        entity: selectedEntity,
        dutyStation: selectedDutyStation,
        department: selectedDept,
        jobTitle: jobTitle.trim() || (isSystemAdmin ? 'Lead Trust Systems Director' : 'HR Professional'),
        role: assignedRole,
        email: activeUser.email || cleanEmail,
        phone: phone.trim() || '+256 700 000000',
      });

      switchRole(assignedRole);

      await recordAuditLog(
        'User Account Created',
        'Auth',
        `New account registered for ${activeUser.email} with role ${assignedRole} at ${selectedDutyStation}.`,
        'users',
        activeUser.uid
      );

      setSuccessMessage('Account registered and profile activated! Logging you into SCT HR...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('[Firebase Auth / Profile Error] Registration flow failed:', {
        code: err?.code,
        message: err?.message,
        error: err,
      });
      setErrorMessage(
        err?.message ? `Registration error: ${err.message}` : 'Registration could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await recordAuditLog('User Sign Out', 'Auth', 'User logged out of active session.');
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 mb-4 border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              className="h-20 w-auto object-contain"
              style={{ aspectRatio: '5 / 4' }}
            />
          </div>
          <h2 className="text-xl font-black text-[#162365]">
            {authUser ? 'Your Security Dossier' : mode === 'login' ? 'Staff Authentication' : 'Create HR Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Special Children's Trust &bull; HR Management System
          </p>
        </div>

        {/* Already Logged In View */}
        {authUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Profile</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  {userProfile?.accountStatus || 'Active'}
                </span>
              </div>
              <div className="font-bold text-base text-slate-900">
                {userProfile?.fullName || authUser.displayName || 'Authorized User'}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{authUser.email}</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-semibold text-emerald-900">{userProfile?.role || currentRole}</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{userProfile?.entity || userProfile?.organization || 'All Entities'} &bull; {userProfile?.department || 'Health'}</span>
              </div>
              {userProfile?.dutyStation && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{userProfile.dutyStation}</span>
                </div>
              )}
            </div>

            {/* Quick Role Switcher for Testing / Demonstration if Admin */}
            {(userProfile?.role === 'System Administrator' || authUser.email === 'nassozishamim50@gmail.com') && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Active Simulation Role:
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => switchRole(e.target.value as UserRole)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg focus:outline-emerald-800"
                >
                  <option value="System Administrator">System Administrator (Full Trust Access)</option>
                  <option value="HR Administrator">HR Administrator</option>
                  <option value="Executive/Director">Executive / Director</option>
                  <option value="Department Head">Department Head</option>
                  <option value="HR Officer">HR Officer</option>
                  <option value="Employee">Employee (Self-Service View)</option>
                </select>
                <p className="text-[11px] text-emerald-800 mt-1">
                  As Administrator, you can simulate permissions across the organization structure.
                </p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Quick Admin Helper Button */}
            <div className="mb-4 p-3 bg-[#FFF9D2] border border-[#FFDE00] rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-[#162365] block">First-Run Primary Admin</span>
                <span className="text-[11px] text-[#162365]/80 font-medium">Pre-fill authorized credentials</span>
              </div>
              <button
                type="button"
                onClick={handleQuickAdminFill}
                className="px-3 py-1.5 bg-[#162365] hover:bg-[#1E318A] text-[#FFDE00] font-black rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFDE00]" />
                <span>Fill Admin</span>
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Actionable Guidance when Email/Password is disabled in Firebase Console */}
            {operationNotAllowed && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Enable Email/Password in Firebase Console</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Your Firebase project <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">ferrous-service-1vr20</code> requires Email/Password provider to be enabled in Firebase Console:
                </p>
                <div className="text-[11px] text-amber-900 space-y-1 pl-2 border-l-2 border-amber-300">
                  <div>1. Go to Firebase Console &rarr; <b>Authentication</b> &rarr; <b>Sign-in method</b></div>
                  <div>2. Click <b>Email/Password</b> &rarr; toggle <b>Enable</b> &rarr; click <b>Save</b></div>
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/ferrous-service-1vr20/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#162365] text-[#FFDE00] font-bold rounded-lg text-[11px] hover:bg-[#1E318A] transition-colors"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    <span>Or Sign In with Google</span>
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#FFDE00] text-[#162365]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'border-[#FFDE00] text-[#162365]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Register New User
              </button>
            </div>

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shamim Nassodzi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Entity *
                      </label>
                      <select
                        value={selectedEntity}
                        onChange={(e) => handleEntityChange(e.target.value as TrustEntity)}
                        className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                      >
                        {entities.map((ent) => (
                          <option key={ent} value={ent}>{ent}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duty Station *
                      </label>
                      <select
                        value={selectedDutyStation}
                        onChange={(e) => setSelectedDutyStation(e.target.value as DutyStation)}
                        className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                      >
                        {DUTY_STATIONS.map((station) => (
                          <option key={station} value={station}>{station}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Department Head">Department Head</option>
                        <option value="HR Officer">HR Officer</option>
                        <option value="HR Administrator">HR Administrator</option>
                        <option value="Executive/Director">Executive/Director</option>
                        <option value="System Administrator">System Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clinical Director"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+256 700 000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@specialchildrenstrust.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-sct-primary w-full mt-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating with Firebase...</span>
                ) : (
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Register Account & Profile'}</span>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                    Or Continue With
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Instant Auth)</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
