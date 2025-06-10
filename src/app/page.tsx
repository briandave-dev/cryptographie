import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Vote, LockKeyhole } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Vote size={48} className="text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Electronic Voting System
          </CardTitle>
          <CardDescription className="text-lg">
            Securely cast your vote and ensure your voice is heard!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium">Secure Voting</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <LockKeyhole className="h-8 w-8 text-blue-500" />
              <p className="text-sm font-medium">End-to-End Encryption</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full h-11 text-lg font-medium transition-all hover:scale-[1.02]" variant="default">
                Login
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button className="w-full h-11 text-lg font-medium transition-all hover:scale-[1.02]" variant="outline">
                Register
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by RSA-2048 (Groupe 3 GL)
        </CardFooter>
      </Card>
    </div>
  );
};



export default HomePage;