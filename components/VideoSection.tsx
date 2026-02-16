import React from 'react';

export const VideoSection: React.FC = () => {
  return (
    <section className="bg-white pb-24 pt-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black aspect-video">
          <iframe 
            src="https://www.tella.tv/video/vid_cmlofyeu300ky04la6bvj2j90/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0" 
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen 
            allowTransparency
            style={{ border: 0 }}
          ></iframe>
        </div>
      </div>
    </section>
  );
};