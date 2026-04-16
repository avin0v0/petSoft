import ContentBlock from "@/components/content-block";
import H1 from "@/components/h1";
import SignOutBtn from "@/components/sign-out";
import { checkAuth } from "@/lib/server-utils";



export default async function Page() {
 
  const session = await checkAuth();
  
  return (
    <main>
      
      <H1 className="my-8">Your Account</H1>
      <ContentBlock className="h-[500px] flex flex-col justify-center items-center">
          <p>Welcome </p>
          <p>Logged in as {session.user.email}</p>
          <SignOutBtn />
      </ContentBlock>
      
    </main>
   
  )
}
