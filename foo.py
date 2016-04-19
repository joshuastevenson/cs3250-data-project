runsF = open ("runs.csv")
runs = runsF.readlines()
runsO = open("out.csv", "w")
#runsO.write(runs[0])
for r in runs:
	if r.split(',')[1] != "NULL":
		runsO.write(r)

runsO.close()