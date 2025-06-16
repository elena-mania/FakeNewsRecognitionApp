# Detectarea știrilor false utilizând AI

Repository-ul conține codul sursa pentru antrenarea modelelor SVM, MultinomialNB și un model BERT pentru clasificara știrilor în limba română, precum și aplicația web care integrează aceste modele pentru predicții automate.

## Notebook
Folderul notebooks conține un fișier .ipynb în care sunt adunate ordonat procesele de:
* Crearea și preprocesarea datasetului
* Crearea setului cu Back-Translation
* Antrenarea și testarea modelelor pe ambele seturi

## Aplicația web

 Modelele sunt încorporate într-o aplicație Web completă cu frontend React și backend FastAPI. Aplicația permite introducerea unui link către o știre, oferind predicții automate din partea celor trei modele integrate.

## Notă privind fișierul modelului

Fișierul `model.safetensors` aferent modelului BERT antrenat nu este inclus în acest depozit din cauza limitărilor impuse de GitHub pentru fișiere mari (peste 100MB).

