// src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex flex-col bg-white mx-auto shadow-lg max-w-md max-width-container">
         {/* mobile full; ≥md center */}   
         <main className="flex-1 w-full md:mx-auto overflow-y-auto">
           {children}
         </main>   
        
       </div>
  )
}