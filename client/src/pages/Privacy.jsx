import { useNavigate } from 'react-router-dom';

function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Privacy & Security
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage your privacy and keep your account secure.
            </p>
          </div>
        </div>

        <div className="space-y-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                🔒
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Private Conversations
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Your conversations are private. Only you and the selected
                  flatmate can access the messages exchanged between you.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                🛡️
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Account Protection
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Your account requires authentication before accessing
                  protected pages such as your profile, preferences and chats.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                👁️
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Profile Privacy
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Your profile information is used to help other users
                  discover compatible flatmates. Sensitive account information
                  such as your password is never displayed publicly.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-2xl">
                ⚙️
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  Your Preferences
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Your flatmate preferences remain saved until you choose to
                  edit them.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/profile-setup')}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage Preferences →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-2xl">
                🚪
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Account Logout
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Always log out when using a shared or public computer to
                  protect your account.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <h2 className="font-bold text-indigo-900">
              Security Note
            </h2>

            <p className="text-sm text-indigo-700 mt-2 leading-6">
              FlatMate.GN keeps authentication and private conversations
              separated from the AI matching system. Gemini is used for
              compatibility matching and is not required to open or use your
              private chats.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Privacy;