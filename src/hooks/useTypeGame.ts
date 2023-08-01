import {
    useState,
    useEffect,
    useRef,
} from "react"

//this file is only for practicing writing custom hook, for this app it should be ideally  put into two component files, but not made into one custom hook.

interface Quote {
    q:string,
    a:string
} 


export default function useTypeGame(startingTime = 30) {
    const [formData, setFormData] = useState('')
    const [timeRemaining, setTimeRemaining] = useState(startingTime)
    const [timeIsRunning, setTimeIsRunning] = useState(false)
    const [quotes, setQuotes] = useState([])
    const [randomQuote, setRandomQuote] = useState<Quote | any>({})
    const [speed, setSpeed] = useState('')

    const inputRef: any = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        async function fetchData(): Promise<void> {
            const response = await fetch('https://raw.githubusercontent.com/Qinisfighting/Assets-for-all/main/quotes.json');
            const data = await response.json();
            let randomIndex: number = Math.floor(Math.random() * data.length);
            setQuotes(data); 
         //   let quote: Quote = quotes[randomIndex]  
            setRandomQuote(data[randomIndex]);
            
          }
          
          fetchData();

    }, [quotes.length])

    const getNewQuote = () => {
        let randomIndex:number = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[randomIndex])

    }

      function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
        const { value } = event.target;
        setFormData(value);
      }

      const calWordsCount = (): number => {
        const wordsCount: string[] = formData
          .trim()
          .split(' ')
          .filter(word => word !== "");
        return wordsCount.length;
      };


      const calAccuracy = (): number => {
        const achievedQuote = String(randomQuote.q)
          .split(' ')
          .slice(0, calWordsCount());

        const typedQuote: string[] = formData.split(' ');
      
        let correctWordsCount: number = 0;
        for (let i: number = 0; i < typedQuote.length; i++) {
          if (achievedQuote.indexOf(typedQuote[i]) >= 0) {
            correctWordsCount += 1;
          }
        }
      
        //console.log(achievedQuote)
        //console.log(typedQuote)
        return Math.floor((correctWordsCount / achievedQuote.length) * 100);
      };
    calAccuracy()

    function reset(): void {
        setTimeIsRunning(true);
        setTimeRemaining(startingTime);
        setFormData('');
        setSpeed('');
        getNewQuote();
     //   console.log(inputRef); //log out the whole textarea object unter current property
        inputRef.current.disabled = false;
        inputRef.current.focus();
      }

      useEffect(() => {
        let wordInSecond: any = () => {
          if (formData.length >= String(randomQuote.q).length) {
            setTimeIsRunning(false);
            wordInSecond = ((startingTime - timeRemaining) / calWordsCount()).toFixed(2);
            setSpeed(wordInSecond);
          } else {
            wordInSecond = (startingTime / calWordsCount()).toFixed(2);
          }
        };
      
        console.log(formData.length);
        console.log(String(randomQuote.q).length);
        wordInSecond();
        // Run every 1000ms, without needing to rely on a re-render.
        if (timeIsRunning) {
          const interval = setInterval(() => {
            setTimeRemaining((currentTime) => {
              // If the current time is 0, then stop the interval and return 0.
              if (currentTime <= 0) {
                clearInterval(interval);
                setTimeIsRunning(false);
                setSpeed(wordInSecond);
                return 0;
              }
              return currentTime - 1;
            });
          }, 1000);
          // Ensure you clear the interval on dismount.
          return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [timeRemaining, timeIsRunning]);

    return {
        formData,
        inputRef,
        handleChange,
        timeIsRunning,
        reset,
        timeRemaining,
        randomQuote,
        speed,
        calAccuracy
    }

}