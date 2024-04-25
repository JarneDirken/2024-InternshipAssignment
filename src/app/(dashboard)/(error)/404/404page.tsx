'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/states/Button';
import Image from 'next/image';

export default function Not404Found() {
    const router = useRouter(); // Get the router object

    // Function to navigate back to the previous page
    const goBack = () => {
        router.back(); // Use the router's back method to go to the previous page
    };

    return (
        <div className='flex flex-col lg:flex-row items-center lg:justify-between justify-center mx-12 lg:mx-24' style={{ minHeight: 'calc(100vh - 128px)' }}>
            <div>
                <Image 
                    src="/assets/svg/403page/403_Error_Forbidden-bro.svg"
                    width={500}
                    height={500}
                    alt="Illustration"
                    priority
                />
            </div>
            <div className='flex flex-col items-end'>
                <h1 className='font-semibold text-3xl md:text-6xl text-custom-primary'>404 Not Found</h1>
                <span>Sorry but the requested source isn't found.</span>
                <span>What do you want to do next?</span>
                <Button 
                    text='Go back'
                    onClick={goBack}
                />
            </div>
        </div>
    );
}