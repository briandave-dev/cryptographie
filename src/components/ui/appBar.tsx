import React from "react";
import SignInButton from "../SignInButton";
import { getSession } from "@/lib/session";
import { Link } from "../Link";

async function AppBar() {
    const session = await getSession();

  return (
    <div className="p-2 shadow flex gap-3 bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
      <Link href={"/"}>Home</Link>
      {/* {
        session || session!.user ? (
          <Link href={"/dashboard"}>Dashboard</Link>
        ) : null
      } */}
      <Link href={"/profile"}>Profile</Link>
      <SignInButton />
    </div>
  );
}

export default AppBar;
