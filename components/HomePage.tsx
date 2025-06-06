"use client";

import { motion } from "framer-motion";
import { FaMicrophone } from "react-icons/fa6";
import { Button } from "./ui/button";
import Image from "next/image";

interface HomePageProps {
  onStartCall: () => void;
}

export default function HomePage({ onStartCall }: HomePageProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center bg-background w-full h-full flex-1 py-8 px-4 md:px-6"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      }}
    >
      <motion.div
        className="text-center mb-8"
        variants={{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { delay: 0.2 } },
          exit: { opacity: 0, y: 20 },
        }}
      >
        {/* <div className="w-40 h-40 mx-auto mb-6 relative">
          <Image 
            src="/cover.png" 
            alt="Карта поляка" 
            fill
            className="object-contain"
            priority
          />
        </div> */}
        <h1 className="text-3xl font-bold mb-2">Симулятор собеседования на Карту поляка</h1>
        <p className="text-muted-foreground">
          Подготовьтесь к экзамену с виртуальным польским консулом
        </p>
      </motion.div>
      
      {/* Features section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl w-full px-4 md:px-0"
        variants={{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { delay: 0.3 } },
          exit: { opacity: 0, y: 20 },
        }}
      >
        <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center p-4 bg-muted/50 rounded-lg">
          <div className="mr-4 md:mr-0 md:mb-3 flex-shrink-0 w-[120px] h-[120px] md:w-[200px] md:h-[200px] relative">
            <Image 
              src="/image-1.png" 
              alt="Реалистичные вопросы" 
              fill
              sizes="(max-width: 768px) 120px, 200px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Реалистичные вопросы</h3>
            <p className="text-muted-foreground text-sm">Виртуальный консул задает вопросы об истории, культуре и традициях Польши</p>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center p-4 bg-muted/50 rounded-lg">
          <div className="mr-4 md:mr-0 md:mb-3 flex-shrink-0 w-[120px] h-[120px] md:w-[200px] md:h-[200px] relative">
            <Image 
              src="/image-2.png" 
              alt="Голосовое общение" 
              fill
              sizes="(max-width: 768px) 120px, 200px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Голосовое общение</h3>
            <p className="text-muted-foreground text-sm">Практикуйте разговорную речь в реальном времени с обратной связью</p>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center p-4 bg-muted/50 rounded-lg">
          <div className="mr-4 md:mr-0 md:mb-3 flex-shrink-0 w-[120px] h-[120px] md:w-[200px] md:h-[200px] relative">
            <Image 
              src="/image-3.png" 
              alt="Оценка ответов" 
              fill
              sizes="(max-width: 768px) 120px, 200px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Оценка ответов</h3>
            <p className="text-muted-foreground text-sm">Получите объективную оценку ваших ответов и полезные советы</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        variants={{
          initial: { scale: 0.5 },
          enter: { scale: 1 },
          exit: { scale: 0.5 },
        }}
      >
        <Button
          className="flex items-center bg-red-500 gap-1.5 px-6 py-6 text-lg rounded-full"
          onClick={onStartCall}
        >
          <FaMicrophone className="size-5 opacity-70" />
          <span>Начать собеседование</span>
        </Button>
      </motion.div>
    </motion.div>
  );
} 