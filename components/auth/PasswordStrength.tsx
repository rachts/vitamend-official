import React from 'react';
interface PasswordStrengthProps {
  password?: string;
}
const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, text: '', color: 'bg-gray-200 dark:bg-slate-700' };
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium', color: 'bg-yellow-500' };
    return { score, text: 'Strong', color: 'bg-green-500' };
  };
  const { score, text, color } = getStrength(password);
  return (
    <div className="w-full space-y-1.5 mt-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400">Password strength:</span>
        <span className={`font-semibold ${
          score <= 2 ? 'text-red-500' : score <= 4 ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {password ? text : ''}
        </span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-all duration-300 ${
              index <= score ? color : 'bg-gray-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
export default PasswordStrength;
