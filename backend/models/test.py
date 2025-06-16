import joblib

# --- 1. Load the SVM pipeline (it contains the vectorizer) ---
# We only need to test one, as they were trained on the same data.
try:
    svm_pipeline = joblib.load('best_svm_pipeline.pkl')
    print("Pipeline loaded successfully.")
except FileNotFoundError:
    print("Error: Could not find 'best_svm_pipeline.pkl'. Make sure it's in the correct folder.")
    exit()

# Extract the TF-IDF vectorizer from the pipeline
vectorizer = svm_pipeline.named_steps['tfidf']
vocabulary = vectorizer.get_feature_names_out()

print(f"Total words in the model's vocabulary: {len(vocabulary)}")
print("-" * 30)


# --- 2. Paste the cleaned text from your debug output ---
cleaned_text = 'ion iliescu suferă de cancer la plămâni a anunțat luni spitalul agrippa ionescu din capitală unde fostul preşedinte al româniei se află internat de o săptămână iliescu a fost supus sub anestezie generală unei proceduri endobronşice care are ca scop menţinerea permeabilităţii căilor respiratorii superioare scrie într-un comunicat transmis de unitatea medicală în urma evaluărilor de specialitate imagistice şi histopatologice efectuate până la acest moment comisia medicală multidisciplinară a stabilit fără dubiu că afecţiunea pulmonară de care suferă pacientul este de natură oncologică în cursul acestei dimineţi sub anestezie generală a beneficiat de o procedură endobronşică ce are ca scop menţinerea permeabilităţii căilor respiratorii superioare intervenţia a decurs fără incidente au transmis reprezentanţii unităţii sanitare potrivit newsro medicii precizează că starea generală a lui ion iliescu rămâne staţionară şi că acesta rămâne internat în secţia de terapie intensivă pentru acordarea îngrijirilor medicale necesare spitalul clinic de urgenţă prof dr agrippa ionescu îşi reafirmă angajamentul de a comunica transparent informaţii de interes public pe acest subiect cu respectarea reglementărilor în vigoare dar în acelaşi timp precizează că singurele informaţii oficiale sunt cele cuprinse în buletinele de informare medicală transmise către opinia publică şi publicate pe pagina de facebook a spitalului mai transmit reprezentanţii spitalului ion iliescu a fost internat luni 9 iunie la spitalul agrippa ionescu cu probleme respiratorii fostul președinte făcea controale medicale periodice la spitalul elias în aprilie 2019 ion iliescu a fost operat de medicii de la institutul cc iliescu diagnosticul său fiind pericardită lichidiană - tamponadă cardiacă în ultimii ani fostul președinte nu a mai avut apariţii publice el transmiţând însă mesaje pe blogul său ultimul astfel de mesaj a fost cel din 19 mai în care l-a felicitat pe nicuşor dan pentru alegerea ca preşedinte editor be urmărește știrile digi24ro și pegoogle news'


# --- 3. Check which words are recognized ---
words_in_text = cleaned_text.split()
recognized_words = [word for word in words_in_text if word in vocabulary]

# --- 4. See the results ---
print(f"Total words in the new article: {len(words_in_text)}")
print(f"Number of RECOGNIZED words: {len(recognized_words)}")
print(f"Recognition percentage: {(len(recognized_words) / len(words_in_text) * 100):.2f}%")
print("\nWords from the article that the model RECOGNIZED:")
print(recognized_words)

